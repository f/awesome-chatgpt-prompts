package com.example.imagematcher.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.documentfile.provider.DocumentFile

/**
 * Storage Access Framework helpers.
 *
 * All file I/O on Android 10+ must go through content URIs.
 * "Rename + Move" between different directories is implemented as:
 *   create new file → copy bytes → delete source (on MOVE mode).
 */
object SafUtils {

    /** Lists all image files (JPEG, PNG, WebP) directly inside [folderUri]. */
    fun listImages(context: Context, folderUri: Uri): List<DocumentFile> {
        val folder = DocumentFile.fromTreeUri(context, folderUri) ?: return emptyList()
        val allowed = setOf("image/jpeg", "image/png", "image/webp")
        return folder.listFiles().filter { it.isFile && allowed.contains(it.type) }
    }

    /**
     * Copies [sourceUri] into [targetFolderUri] with the given [newFileName].
     * Returns the URI of the newly created file, or null on failure.
     * Collision policy is applied before creation.
     */
    fun copyFile(
        context: Context,
        sourceUri: Uri,
        targetFolderUri: Uri,
        newFileName: String,
        onCollision: String
    ): Uri? {
        val targetFolder = DocumentFile.fromTreeUri(context, targetFolderUri) ?: return null
        val sourceDoc = DocumentFile.fromSingleUri(context, sourceUri) ?: return null
        val mimeType = sourceDoc.type ?: guessMime(newFileName)

        val resolvedName = resolveCollision(targetFolder, newFileName, onCollision) ?: return null
        val newFile = targetFolder.createFile(mimeType, resolvedName) ?: return null

        return try {
            context.contentResolver.openInputStream(sourceUri)?.use { input ->
                context.contentResolver.openOutputStream(newFile.uri)?.use { output ->
                    input.copyTo(output, bufferSize = 65_536)
                }
            }
            newFile.uri
        } catch (e: Exception) {
            newFile.delete()
            null
        }
    }

    /**
     * Moves [sourceUri] into [targetFolderUri] with the given [newFileName].
     * The source is deleted only after a successful copy.
     */
    fun moveFile(
        context: Context,
        sourceUri: Uri,
        targetFolderUri: Uri,
        newFileName: String,
        onCollision: String
    ): Uri? {
        val newUri = copyFile(context, sourceUri, targetFolderUri, newFileName, onCollision)
        if (newUri != null) {
            DocumentFile.fromSingleUri(context, sourceUri)?.delete()
        }
        return newUri
    }

    /**
     * Handles name collisions according to [onCollision]:
     *  - RENAME   → appends __v2, __v3, … until a free slot is found
     *  - SKIP     → returns null (caller should abort and notify user)
     *  - OVERWRITE → deletes the existing file and returns the original name
     */
    private fun resolveCollision(
        folder: DocumentFile,
        fileName: String,
        onCollision: String
    ): String? {
        val existing = folder.findFile(fileName)
        if (existing == null) return fileName

        return when (onCollision) {
            "OVERWRITE" -> {
                existing.delete()
                fileName
            }
            "SKIP" -> null
            else -> {  // RENAME (default)
                val dotIdx = fileName.lastIndexOf('.')
                val base = if (dotIdx >= 0) fileName.substring(0, dotIdx) else fileName
                val ext  = if (dotIdx >= 0) fileName.substring(dotIdx) else ""
                var v = 2
                var candidate = "${base}__v${v}${ext}"
                while (folder.findFile(candidate) != null) {
                    v++
                    candidate = "${base}__v${v}${ext}"
                }
                candidate
            }
        }
    }

    /** Takes persistent read+write permission for a tree URI so it survives reboots. */
    fun takePersistablePermission(context: Context, uri: Uri) {
        try {
            context.contentResolver.takePersistableUriPermission(
                uri,
                Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
            )
        } catch (_: SecurityException) { /* already persisted or unavailable */ }
    }

    private fun guessMime(filename: String): String {
        return when (filename.substringAfterLast('.', "").lowercase()) {
            "jpg", "jpeg" -> "image/jpeg"
            "png"         -> "image/png"
            "webp"        -> "image/webp"
            else          -> "image/jpeg"
        }
    }
}
