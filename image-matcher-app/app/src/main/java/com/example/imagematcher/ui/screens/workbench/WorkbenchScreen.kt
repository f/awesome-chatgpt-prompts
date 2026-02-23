package com.example.imagematcher.ui.screens.workbench

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.imagematcher.data.model.ImageFile
import com.example.imagematcher.util.CompareResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkbenchScreen(
    navController: NavController,
    vm: WorkbenchViewModel = viewModel()
) {
    val state by vm.uiState.collectAsState()

    // Image selection dialog
    var dialogImage by remember { mutableStateOf<ImageFile?>(null) }

    // Per-operation folder overrides
    val sourceTargetPicker = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocumentTree()
    ) { uri -> uri?.let { vm.setSourceTargetUri(it) } }

    val editedTargetPicker = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocumentTree()
    ) { uri -> uri?.let { vm.setEditedTargetUri(it) } }

    // Similarity warning dialog
    if (state.warningCompare != null) {
        val resultLabel = when (state.warningCompare!!.result) {
            CompareResult.IDENTICAL    -> "IDENTICAL"
            CompareResult.VERY_SIMILAR -> "VERY SIMILAR (${(state.warningCompare!!.score * 100).toInt()}%)"
            CompareResult.DIFFERENT    -> "DIFFERENT"
        }
        AlertDialog(
            onDismissRequest = vm::cancelWarning,
            icon = { Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
            title = { Text("Images appear $resultLabel") },
            text  = {
                Text(
                    "The selected images look almost identical — the edited version may not have been changed.\n\n" +
                    "Do you want to continue pairing them anyway?"
                )
            },
            confirmButton = {
                TextButton(onClick = vm::confirmDespiteWarning) { Text("Continue") }
            },
            dismissButton = {
                TextButton(onClick = vm::cancelWarning) { Text("Cancel") }
            }
        )
    }

    // Slot assignment dialog
    dialogImage?.let { img ->
        AlertDialog(
            onDismissRequest = { dialogImage = null },
            title = { Text(img.displayName, maxLines = 2, overflow = TextOverflow.Ellipsis) },
            text  = { Text("Assign this image to:") },
            confirmButton = {
                TextButton(onClick = {
                    vm.selectForSlot(img, SlotType.SOURCE)
                    dialogImage = null
                }) { Text("Set as SOURCE") }
            },
            dismissButton = {
                TextButton(onClick = {
                    vm.selectForSlot(img, SlotType.EDITED)
                    dialogImage = null
                }) { Text("Set as EDITED") }
            }
        )
    }

    // Snackbar messages
    val snackbarHost = remember { SnackbarHostState() }
    LaunchedEffect(state.errorMessage) {
        state.errorMessage?.let {
            snackbarHost.showSnackbar(it)
            vm.clearMessage()
        }
    }
    LaunchedEffect(state.successMessage) {
        state.successMessage?.let {
            snackbarHost.showSnackbar(it)
            vm.clearMessage()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Workbench") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                ),
                actions = {
                    IconButton(onClick = vm::refreshImages) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                    IconButton(onClick = { navController.navigate("settings") }) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings")
                    }
                }
            )
        },
        snackbarHost = { SnackbarHost(snackbarHost) }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {

            // ── Slot panel ────────────────────────────────────────────────────
            SlotPanel(
                source     = state.selectedSource,
                edited     = state.selectedEdited,
                onClearSrc = { vm.clearSlot(SlotType.SOURCE) },
                onClearEdt = { vm.clearSlot(SlotType.EDITED) }
            )

            HorizontalDivider()

            // ── Target overrides ──────────────────────────────────────────────
            TargetRow(
                sourceTarget = state.sourceTargetUri,
                editedTarget = state.editedTargetUri,
                onPickSource = { sourceTargetPicker.launch(null) },
                onPickEdited = { editedTargetPicker.launch(null) }
            )

            HorizontalDivider()

            // ── Action button ─────────────────────────────────────────────────
            Button(
                onClick  = vm::startPairOperation,
                enabled  = !state.isLoading,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                if (state.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(18.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                    Spacer(Modifier.width(8.dp))
                }
                Text("Pair + Rename + Transfer")
            }

            HorizontalDivider()

            // ── Image pool grid ───────────────────────────────────────────────
            if (state.images.isEmpty() && !state.isLoading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        "No images found.\nAdd input folders in Settings.",
                        textAlign = TextAlign.Center,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(100.dp),
                    contentPadding = PaddingValues(8.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(state.images, key = { it.uri.toString() }) { img ->
                        ImageTile(
                            image     = img,
                            isSource  = state.selectedSource?.uri == img.uri,
                            isEdited  = state.selectedEdited?.uri == img.uri,
                            onClick   = { dialogImage = img }
                        )
                    }
                }
            }
        }
    }
}

// ── Slot panel ────────────────────────────────────────────────────────────────

@Composable
private fun SlotPanel(
    source: ImageFile?,
    edited: ImageFile?,
    onClearSrc: () -> Unit,
    onClearEdt: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        ImageSlot(
            label    = "SOURCE",
            image    = source,
            color    = MaterialTheme.colorScheme.primary,
            onClear  = onClearSrc,
            modifier = Modifier.weight(1f)
        )
        ImageSlot(
            label    = "EDITED",
            image    = edited,
            color    = MaterialTheme.colorScheme.tertiary,
            onClear  = onClearEdt,
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun ImageSlot(
    label: String,
    image: ImageFile?,
    color: Color,
    onClear: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.height(140.dp),
        border = BorderStroke(2.dp, color),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Box(Modifier.fillMaxSize()) {
            if (image != null) {
                AsyncImage(
                    model = image.uri,
                    contentDescription = image.displayName,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                // Label badge
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White,
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .background(color.copy(alpha = 0.8f))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                )
                // Filename badge at bottom
                Text(
                    text = image.displayName,
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .background(Color.Black.copy(alpha = 0.55f))
                        .padding(horizontal = 4.dp, vertical = 2.dp)
                )
                // Clear button
                IconButton(
                    onClick = onClear,
                    modifier = Modifier.align(Alignment.TopEnd)
                ) {
                    Icon(
                        Icons.Default.Close,
                        contentDescription = "Clear $label",
                        tint = Color.White,
                        modifier = Modifier
                            .background(Color.Black.copy(alpha = 0.4f), RoundedCornerShape(50))
                            .size(20.dp)
                    )
                }
            } else {
                Column(
                    Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        Icons.Default.AddPhotoAlternate,
                        contentDescription = null,
                        tint = color,
                        modifier = Modifier.size(32.dp)
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = label,
                        style = MaterialTheme.typography.labelMedium,
                        color = color
                    )
                }
            }
        }
    }
}

// ── Target row ────────────────────────────────────────────────────────────────

@Composable
private fun TargetRow(
    sourceTarget: String,
    editedTarget: String,
    onPickSource: () -> Unit,
    onPickEdited: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Text("Destination (this operation)", style = MaterialTheme.typography.labelMedium)
        TargetPickerRow("Originals →", sourceTarget, onPickSource)
        TargetPickerRow("Edited →",    editedTarget, onPickEdited)
    }
}

@Composable
private fun TargetPickerRow(label: String, value: String, onPick: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(label, style = MaterialTheme.typography.bodySmall, modifier = Modifier.width(80.dp))
        Text(
            text = if (value.isBlank()) "Not set" else compactUri(value),
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.weight(1f),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
        TextButton(onClick = onPick, contentPadding = PaddingValues(horizontal = 8.dp)) {
            Text("Browse")
        }
    }
}

// ── Image tile ────────────────────────────────────────────────────────────────

@Composable
private fun ImageTile(
    image: ImageFile,
    isSource: Boolean,
    isEdited: Boolean,
    onClick: () -> Unit
) {
    val borderColor = when {
        isSource -> MaterialTheme.colorScheme.primary
        isEdited -> MaterialTheme.colorScheme.tertiary
        else     -> Color.Transparent
    }
    val borderWidth = if (isSource || isEdited) 3.dp else 0.dp

    Box(
        modifier = Modifier
            .aspectRatio(1f)
            .clip(RoundedCornerShape(6.dp))
            .clickable(onClick = onClick)
    ) {
        AsyncImage(
            model            = image.uri,
            contentDescription = image.displayName,
            contentScale     = ContentScale.Crop,
            modifier         = Modifier.fillMaxSize()
        )
        // Selection indicator
        if (isSource || isEdited) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(borderColor.copy(alpha = 0.25f))
            )
            val badgeText = if (isSource) "SRC" else "EDT"
            Text(
                text = badgeText,
                style = MaterialTheme.typography.labelSmall,
                color = Color.White,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .background(borderColor.copy(alpha = 0.85f))
                    .padding(horizontal = 4.dp, vertical = 1.dp)
            )
        }
        // Filename at bottom
        Text(
            text = image.displayName,
            style = MaterialTheme.typography.labelSmall,
            color = Color.White,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Color.Black.copy(alpha = 0.5f))
                .padding(horizontal = 3.dp, vertical = 1.dp)
        )
    }
}

private fun compactUri(uriStr: String): String {
    val decoded = Uri.decode(uriStr)
    return decoded.substringAfterLast(':').ifBlank { decoded.substringAfterLast('/') }
}
