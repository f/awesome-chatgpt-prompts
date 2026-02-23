package com.example.imagematcher.data.repository

import android.content.Context
import android.net.Uri
import com.example.imagematcher.data.db.AppDatabase
import com.example.imagematcher.data.db.PairRecord
import com.example.imagematcher.data.model.ImageFile
import com.example.imagematcher.util.CompareOutput
import com.example.imagematcher.util.FileUtils
import com.example.imagematcher.util.ImageCompare
import com.example.imagematcher.util.SafUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

sealed class PairOperationResult {
    data class Success(val record: PairRecord) : PairOperationResult()
    data class Error(val message: String) : PairOperationResult()
}

class PairRepository(
    private val context: Context,
    private val db: AppDatabase
) {
    private val dao = db.pairRecordDao()

    fun getAllRecords(): Flow<List<PairRecord>> = dao.getAllRecords()

    /** Scans all given SAF tree URIs and returns discovered image files. */
    suspend fun scanInputFolders(inputUris: List<String>): List<ImageFile> =
        withContext(Dispatchers.IO) {
            buildList {
                for (uriStr in inputUris) {
                    val uri = Uri.parse(uriStr)
                    SafUtils.listImages(context, uri).forEach { doc ->
                        add(
                            ImageFile(
                                uri = doc.uri,
                                displayName = doc.name ?: "unknown",
                                lastModified = doc.lastModified(),
                                mimeType = doc.type ?: "image/jpeg"
                            )
                        )
                    }
                }
            }
        }

    /** Runs the image comparison on an IO thread. */
    suspend fun checkSimilarity(sourceUri: Uri, editedUri: Uri): CompareOutput =
        withContext(Dispatchers.IO) {
            ImageCompare.compareImages(context, sourceUri, editedUri)
        }

    /**
     * Full pairing operation:
     *  1. Insert a placeholder record → get the serial ID.
     *  2. Build the new filename for the edited image.
     *  3. Copy/Move both files to their target folders.
     *  4. Update the DB record with the resulting URIs.
     *
     * If source transfer fails, the entire operation is aborted (no files deleted).
     * If edited transfer fails after source was already moved, the DB record is
     * marked with a partial error code so the operator can investigate.
     */
    suspend fun performPairOperation(
        sourceFile: ImageFile,
        editedFile: ImageFile,
        sourceTargetUri: Uri,
        editedTargetUri: Uri,
        mode: String,
        onCollision: String,
        serialPadding: Int,
        compareOutput: CompareOutput
    ): PairOperationResult = withContext(Dispatchers.IO) {

        // 1. Insert placeholder to obtain the auto-generated serial ID
        val placeholder = PairRecord(
            createdAt = System.currentTimeMillis(),
            sourceUri = sourceFile.uri.toString(),
            editedUriBefore = editedFile.uri.toString(),
            compareResult = compareOutput.result.name,
            compareScore = compareOutput.score
        )
        val serialId = dao.insert(placeholder).toInt()

        // 2. Build edited filename
        val serialPadded = FileUtils.padSerial(serialId, serialPadding)
        val sourceBase = FileUtils.getBaseName(sourceFile.displayName)
        val editedExt  = FileUtils.getExtension(editedFile.displayName)
        val newEditedFilename = FileUtils.buildEditedFilename(serialPadded, sourceBase, editedExt)

        // 3a. Transfer source image (keep original filename)
        val sourceNewUri: Uri? = when (mode) {
            "MOVE" -> SafUtils.moveFile(context, sourceFile.uri, sourceTargetUri, sourceFile.displayName, onCollision)
            else   -> SafUtils.copyFile(context, sourceFile.uri, sourceTargetUri, sourceFile.displayName, onCollision)
        }

        if (sourceNewUri == null) {
            dao.update(placeholder.copy(id = serialId, compareResult = "ERROR_SOURCE_TRANSFER"))
            return@withContext PairOperationResult.Error(
                "Failed to transfer the source image. " +
                "Check the destination folder or the name-collision setting."
            )
        }

        // 3b. Transfer edited image with new name
        val editedNewUri: Uri? = when (mode) {
            "MOVE" -> SafUtils.moveFile(context, editedFile.uri, editedTargetUri, newEditedFilename, onCollision)
            else   -> SafUtils.copyFile(context, editedFile.uri, editedTargetUri, newEditedFilename, onCollision)
        }

        if (editedNewUri == null) {
            // Source was already transferred; mark partial failure for manual recovery
            dao.update(
                placeholder.copy(
                    id = serialId,
                    sourceUriAfter = sourceNewUri.toString(),
                    compareResult = "ERROR_EDITED_TRANSFER"
                )
            )
            return@withContext PairOperationResult.Error(
                "Source transferred but edited-image transfer failed. " +
                "Check the destination folder or the name-collision setting."
            )
        }

        // 4. Finalise record
        val finalRecord = PairRecord(
            id = serialId,
            createdAt = placeholder.createdAt,
            sourceUri = sourceFile.uri.toString(),
            editedUriBefore = editedFile.uri.toString(),
            sourceUriAfter = sourceNewUri.toString(),
            editedUriAfter = editedNewUri.toString(),
            editedNewFilename = newEditedFilename,
            compareResult = compareOutput.result.name,
            compareScore = compareOutput.score
        )
        dao.update(finalRecord)

        PairOperationResult.Success(finalRecord)
    }
}
