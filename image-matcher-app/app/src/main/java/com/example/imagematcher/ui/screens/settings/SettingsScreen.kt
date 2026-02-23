package com.example.imagematcher.ui.screens.settings

import android.app.Activity
import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    navController: NavController,
    vm: SettingsViewModel = viewModel()
) {
    val state by vm.uiState.collectAsState()

    // Folder pickers
    val inputFolderPicker = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocumentTree()
    ) { uri ->
        uri?.let { vm.addInputFolder(it) }
    }
    val originalTargetPicker = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocumentTree()
    ) { uri ->
        uri?.let { vm.setDefaultOriginalTarget(it) }
    }
    val editedTargetPicker = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocumentTree()
    ) { uri ->
        uri?.let { vm.setDefaultEditedTarget(it) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {

            // ── Input folders ─────────────────────────────────────────────────
            item {
                SectionHeader("Input Folders (Image Pool)")
            }
            items(state.inputFolderUris) { uriStr ->
                FolderRow(
                    label = compactUri(uriStr),
                    onRemove = { vm.removeInputFolder(uriStr) }
                )
            }
            item {
                OutlinedButton(
                    onClick = {
                        inputFolderPicker.launch(null)
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Add, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text("Add Input Folder")
                }
            }

            // ── Default targets ───────────────────────────────────────────────
            item { Spacer(Modifier.height(4.dp)) }
            item { SectionHeader("Default Target Folders") }

            item {
                FolderPickerRow(
                    label = "Originals target",
                    value = state.defaultOriginalTargetUri,
                    onPick = { originalTargetPicker.launch(null) }
                )
            }
            item {
                FolderPickerRow(
                    label = "Edited target",
                    value = state.defaultEditedTargetUri,
                    onPick = { editedTargetPicker.launch(null) }
                )
            }

            // ── Mode ──────────────────────────────────────────────────────────
            item { Spacer(Modifier.height(4.dp)) }
            item { SectionHeader("Operation Mode") }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("MOVE", "COPY").forEach { option ->
                        FilterChip(
                            selected = state.mode == option,
                            onClick  = { vm.setMode(option) },
                            label    = { Text(option) }
                        )
                    }
                }
            }

            // ── Name collision ────────────────────────────────────────────────
            item { SectionHeader("Name Collision") }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("RENAME", "SKIP", "OVERWRITE").forEach { option ->
                        FilterChip(
                            selected = state.onNameCollision == option,
                            onClick  = { vm.setOnNameCollision(option) },
                            label    = { Text(option) }
                        )
                    }
                }
            }

            // ── Serial padding ────────────────────────────────────────────────
            item { SectionHeader("Serial Number Padding") }
            item {
                var paddingText by remember(state.serialPadding) {
                    mutableStateOf(state.serialPadding.toString())
                }
                OutlinedTextField(
                    value = paddingText,
                    onValueChange = { raw ->
                        paddingText = raw
                        raw.toIntOrNull()?.takeIf { it in 1..12 }?.let { vm.setSerialPadding(it) }
                    },
                    label = { Text("Digits (1–12)") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.width(160.dp)
                )
            }
        }
    }
}

// ── Small reusable composables ────────────────────────────────────────────────

@Composable
private fun SectionHeader(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleSmall,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(top = 4.dp, bottom = 2.dp)
    )
}

@Composable
private fun FolderRow(label: String, onRemove: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
    ) {
        Icon(
            Icons.Default.FolderOpen,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.secondary,
            modifier = Modifier.size(20.dp)
        )
        Spacer(Modifier.width(8.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.weight(1f)
        )
        IconButton(onClick = onRemove) {
            Icon(Icons.Default.Delete, contentDescription = "Remove folder")
        }
    }
}

@Composable
private fun FolderPickerRow(label: String, value: String, onPick: () -> Unit) {
    Column {
        Text(label, style = MaterialTheme.typography.labelMedium)
        Spacer(Modifier.height(4.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = if (value.isBlank()) "Not set" else compactUri(value),
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.weight(1f)
            )
            OutlinedButton(onClick = onPick, contentPadding = PaddingValues(horizontal = 12.dp)) {
                Icon(Icons.Default.FolderOpen, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(4.dp))
                Text("Browse")
            }
        }
    }
}

/** Shortens a SAF tree URI to a readable folder name. */
private fun compactUri(uriStr: String): String {
    val decoded = Uri.decode(uriStr)
    return decoded.substringAfterLast(':').ifBlank { decoded.substringAfterLast('/') }
}
