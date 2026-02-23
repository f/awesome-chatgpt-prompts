package com.example.imagematcher.data.model

import android.net.Uri

/**
 * Lightweight representation of an image file discovered from an input folder.
 * Uses content URI so it works under Scoped Storage / SAF.
 */
data class ImageFile(
    val uri: Uri,
    val displayName: String,
    val lastModified: Long,
    val mimeType: String
)
