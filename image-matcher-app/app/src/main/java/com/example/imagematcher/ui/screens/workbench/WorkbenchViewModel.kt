package com.example.imagematcher.ui.screens.workbench

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.imagematcher.data.datastore.AppSettings
import com.example.imagematcher.data.db.AppDatabase
import com.example.imagematcher.data.model.ImageFile
import com.example.imagematcher.data.repository.PairOperationResult
import com.example.imagematcher.data.repository.PairRepository
import com.example.imagematcher.util.CompareOutput
import com.example.imagematcher.util.CompareResult
import com.example.imagematcher.util.SafUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class SlotType { SOURCE, EDITED }

data class WorkbenchUiState(
    val images: List<ImageFile> = emptyList(),
    val processedUris: Set<String> = emptySet(),
    val selectedSource: ImageFile? = null,
    val selectedEdited: ImageFile? = null,
    val sourceTargetUri: String = "",
    val editedTargetUri: String = "",
    val mode: String = "MOVE",
    val onCollision: String = "RENAME",
    val serialPadding: Int = 6,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val successMessage: String? = null,
    // Non-null when user must confirm a similarity warning before the operation proceeds
    val warningCompare: CompareOutput? = null
)

class WorkbenchViewModel(application: Application) : AndroidViewModel(application) {

    private val settings = AppSettings(application)
    private val db = AppDatabase.getInstance(application)
    private val repository = PairRepository(application, db)

    private val _uiState = MutableStateFlow(WorkbenchUiState())
    val uiState: StateFlow<WorkbenchUiState> = _uiState.asStateFlow()

    // Held in memory while the warning dialog is shown
    private var pendingSource: ImageFile? = null
    private var pendingEdited: ImageFile? = null
    private var pendingCompare: CompareOutput? = null

    init {
        viewModelScope.launch {
            settings.defaultOriginalTargetUri.collect { v ->
                _uiState.update { it.copy(sourceTargetUri = v) }
            }
        }
        viewModelScope.launch {
            settings.defaultEditedTargetUri.collect { v ->
                _uiState.update { it.copy(editedTargetUri = v) }
            }
        }
        viewModelScope.launch {
            settings.mode.collect { v -> _uiState.update { it.copy(mode = v) } }
        }
        viewModelScope.launch {
            settings.onNameCollision.collect { v -> _uiState.update { it.copy(onCollision = v) } }
        }
        viewModelScope.launch {
            settings.serialPadding.collect { v -> _uiState.update { it.copy(serialPadding = v) } }
        }
        viewModelScope.launch {
            settings.inputFolderUris.collect { uris ->
                if (uris.isNotEmpty()) loadImages(uris)
            }
        }
    }

    fun refreshImages() {
        viewModelScope.launch {
            loadImages(settings.inputFolderUris.first())
        }
    }

    private suspend fun loadImages(inputUris: List<String>) {
        _uiState.update { it.copy(isLoading = true) }
        val allImages = repository.scanInputFolders(inputUris)
        _uiState.update { state ->
            state.copy(
                images = allImages.filter { !state.processedUris.contains(it.uri.toString()) },
                isLoading = false
            )
        }
    }

    fun selectForSlot(image: ImageFile, slot: SlotType) {
        _uiState.update { state ->
            when (slot) {
                SlotType.SOURCE -> state.copy(selectedSource = image)
                SlotType.EDITED -> state.copy(selectedEdited = image)
            }
        }
    }

    fun clearSlot(slot: SlotType) {
        _uiState.update { state ->
            when (slot) {
                SlotType.SOURCE -> state.copy(selectedSource = null)
                SlotType.EDITED -> state.copy(selectedEdited = null)
            }
        }
    }

    fun setSourceTargetUri(uri: Uri) {
        SafUtils.takePersistablePermission(getApplication(), uri)
        _uiState.update { it.copy(sourceTargetUri = uri.toString()) }
    }

    fun setEditedTargetUri(uri: Uri) {
        SafUtils.takePersistablePermission(getApplication(), uri)
        _uiState.update { it.copy(editedTargetUri = uri.toString()) }
    }

    /** Validates inputs and then checks image similarity before proceeding. */
    fun startPairOperation() {
        val state = _uiState.value

        val source = state.selectedSource
            ?: return showError("Please assign a source image.")
        val edited = state.selectedEdited
            ?: return showError("Please assign an edited image.")

        if (source.uri == edited.uri)
            return showError("Source and edited must be different images.")
        if (state.sourceTargetUri.isBlank())
            return showError("Set a destination folder for the original images.")
        if (state.editedTargetUri.isBlank())
            return showError("Set a destination folder for the edited images.")

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val compareOutput = repository.checkSimilarity(source.uri, edited.uri)

            if (compareOutput.result == CompareResult.IDENTICAL ||
                compareOutput.result == CompareResult.VERY_SIMILAR
            ) {
                // Pause and show warning dialog
                pendingSource  = source
                pendingEdited  = edited
                pendingCompare = compareOutput
                _uiState.update { it.copy(isLoading = false, warningCompare = compareOutput) }
            } else {
                executeOperation(source, edited, compareOutput)
            }
        }
    }

    /** Called when the user taps "Continue" on the similarity warning dialog. */
    fun confirmDespiteWarning() {
        val src = pendingSource  ?: return
        val edt = pendingEdited  ?: return
        val cmp = pendingCompare ?: return
        _uiState.update { it.copy(warningCompare = null, isLoading = true) }
        viewModelScope.launch { executeOperation(src, edt, cmp) }
    }

    /** Called when the user taps "Cancel" on the similarity warning dialog. */
    fun cancelWarning() {
        pendingSource  = null
        pendingEdited  = null
        pendingCompare = null
        _uiState.update { it.copy(warningCompare = null, isLoading = false) }
    }

    fun clearMessage() {
        _uiState.update { it.copy(errorMessage = null, successMessage = null) }
    }

    // ── Private ──────────────────────────────────────────────────────────────

    private suspend fun executeOperation(
        source: ImageFile,
        edited: ImageFile,
        compareOutput: CompareOutput
    ) {
        val state = _uiState.value
        val result = repository.performPairOperation(
            sourceFile       = source,
            editedFile       = edited,
            sourceTargetUri  = Uri.parse(state.sourceTargetUri),
            editedTargetUri  = Uri.parse(state.editedTargetUri),
            mode             = state.mode,
            onCollision      = state.onCollision,
            serialPadding    = state.serialPadding,
            compareOutput    = compareOutput
        )

        pendingSource  = null
        pendingEdited  = null
        pendingCompare = null

        when (result) {
            is PairOperationResult.Success -> {
                _uiState.update { currentState ->
                    val done = currentState.processedUris.toMutableSet().apply {
                        add(source.uri.toString())
                        add(edited.uri.toString())
                    }
                    currentState.copy(
                        isLoading = false,
                        selectedSource = null,
                        selectedEdited = null,
                        images = currentState.images.filter { img ->
                            !done.contains(img.uri.toString())
                        },
                        processedUris = done,
                        successMessage = "Done: ${result.record.editedNewFilename}"
                    )
                }
            }
            is PairOperationResult.Error -> {
                _uiState.update { it.copy(isLoading = false, errorMessage = result.message) }
            }
        }
    }

    private fun showError(msg: String) {
        _uiState.update { it.copy(errorMessage = msg) }
    }
}
