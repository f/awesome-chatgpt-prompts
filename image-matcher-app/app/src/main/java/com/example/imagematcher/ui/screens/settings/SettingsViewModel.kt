package com.example.imagematcher.ui.screens.settings

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.imagematcher.data.datastore.AppSettings
import com.example.imagematcher.util.SafUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class SettingsUiState(
    val inputFolderUris: List<String> = emptyList(),
    val defaultOriginalTargetUri: String = "",
    val defaultEditedTargetUri: String = "",
    val mode: String = "MOVE",
    val onNameCollision: String = "RENAME",
    val serialPadding: Int = 6
)

class SettingsViewModel(application: Application) : AndroidViewModel(application) {

    private val settings = AppSettings(application)

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            settings.inputFolderUris.collect { v ->
                _uiState.update { it.copy(inputFolderUris = v) }
            }
        }
        viewModelScope.launch {
            settings.defaultOriginalTargetUri.collect { v ->
                _uiState.update { it.copy(defaultOriginalTargetUri = v) }
            }
        }
        viewModelScope.launch {
            settings.defaultEditedTargetUri.collect { v ->
                _uiState.update { it.copy(defaultEditedTargetUri = v) }
            }
        }
        viewModelScope.launch {
            settings.mode.collect { v ->
                _uiState.update { it.copy(mode = v) }
            }
        }
        viewModelScope.launch {
            settings.onNameCollision.collect { v ->
                _uiState.update { it.copy(onNameCollision = v) }
            }
        }
        viewModelScope.launch {
            settings.serialPadding.collect { v ->
                _uiState.update { it.copy(serialPadding = v) }
            }
        }
    }

    fun addInputFolder(uri: Uri) {
        SafUtils.takePersistablePermission(getApplication(), uri)
        viewModelScope.launch {
            val current = _uiState.value.inputFolderUris.toMutableList()
            val s = uri.toString()
            if (!current.contains(s)) {
                current.add(s)
                settings.setInputFolderUris(current)
            }
        }
    }

    fun removeInputFolder(uriStr: String) {
        viewModelScope.launch {
            val current = _uiState.value.inputFolderUris.toMutableList()
            current.remove(uriStr)
            settings.setInputFolderUris(current)
        }
    }

    fun setDefaultOriginalTarget(uri: Uri) {
        SafUtils.takePersistablePermission(getApplication(), uri)
        viewModelScope.launch { settings.setDefaultOriginalTargetUri(uri.toString()) }
    }

    fun setDefaultEditedTarget(uri: Uri) {
        SafUtils.takePersistablePermission(getApplication(), uri)
        viewModelScope.launch { settings.setDefaultEditedTargetUri(uri.toString()) }
    }

    fun setMode(mode: String) {
        viewModelScope.launch { settings.setMode(mode) }
    }

    fun setOnNameCollision(value: String) {
        viewModelScope.launch { settings.setOnNameCollision(value) }
    }

    fun setSerialPadding(padding: Int) {
        viewModelScope.launch { settings.setSerialPadding(padding) }
    }
}
