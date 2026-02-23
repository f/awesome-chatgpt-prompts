package com.example.imagematcher.data.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "app_settings")

/**
 * Persisted application settings via DataStore.
 *
 * Input folder URIs are stored as a pipe-separated string because DataStore preferences
 * does not natively support Set<String> with guaranteed ordering.
 */
class AppSettings(private val context: Context) {

    companion object {
        val INPUT_FOLDER_URIS = stringPreferencesKey("input_folder_uris")
        val DEFAULT_ORIGINAL_TARGET_URI = stringPreferencesKey("default_original_target_uri")
        val DEFAULT_EDITED_TARGET_URI = stringPreferencesKey("default_edited_target_uri")
        val MODE = stringPreferencesKey("mode")
        val ON_NAME_COLLISION = stringPreferencesKey("on_name_collision")
        val SERIAL_PADDING = intPreferencesKey("serial_padding")
    }

    val inputFolderUris: Flow<List<String>> = context.dataStore.data.map { prefs ->
        val raw = prefs[INPUT_FOLDER_URIS] ?: ""
        if (raw.isBlank()) emptyList()
        else raw.split("|").filter { it.isNotBlank() }
    }

    val defaultOriginalTargetUri: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[DEFAULT_ORIGINAL_TARGET_URI] ?: ""
    }

    val defaultEditedTargetUri: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[DEFAULT_EDITED_TARGET_URI] ?: ""
    }

    val mode: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[MODE] ?: "MOVE"
    }

    val onNameCollision: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[ON_NAME_COLLISION] ?: "RENAME"
    }

    val serialPadding: Flow<Int> = context.dataStore.data.map { prefs ->
        prefs[SERIAL_PADDING] ?: 6
    }

    suspend fun setInputFolderUris(uris: List<String>) {
        context.dataStore.edit { prefs ->
            prefs[INPUT_FOLDER_URIS] = uris.joinToString("|")
        }
    }

    suspend fun setDefaultOriginalTargetUri(uri: String) {
        context.dataStore.edit { prefs ->
            prefs[DEFAULT_ORIGINAL_TARGET_URI] = uri
        }
    }

    suspend fun setDefaultEditedTargetUri(uri: String) {
        context.dataStore.edit { prefs ->
            prefs[DEFAULT_EDITED_TARGET_URI] = uri
        }
    }

    suspend fun setMode(mode: String) {
        context.dataStore.edit { prefs ->
            prefs[MODE] = mode
        }
    }

    suspend fun setOnNameCollision(value: String) {
        context.dataStore.edit { prefs ->
            prefs[ON_NAME_COLLISION] = value
        }
    }

    suspend fun setSerialPadding(padding: Int) {
        context.dataStore.edit { prefs ->
            prefs[SERIAL_PADDING] = padding
        }
    }
}
