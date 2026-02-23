package com.example.imagematcher.util

/**
 * Filename manipulation helpers.
 *
 * Output format for edited images:
 *   edited_<serial>__src_<sanitized_source_base>.<edited_ext>
 *
 * Example: edited_000042__src_portrait_final.jpg
 */
object FileUtils {

    /**
     * Removes or replaces characters that are illegal in filenames on most filesystems.
     * Collapses consecutive underscores and limits total length.
     */
    fun sanitizeFilename(name: String, maxLength: Int = 80): String =
        name
            .replace(Regex("[^a-zA-Z0-9._\\-]"), "_")
            .replace(Regex("_+"), "_")
            .trimStart('_')
            .take(maxLength)

    /** Builds the canonical edited filename from its components. */
    fun buildEditedFilename(
        serialPadded: String,
        sourceBaseName: String,
        editedExtension: String
    ): String {
        val sanitized = sanitizeFilename(sourceBaseName)
        val ext = if (editedExtension.startsWith('.')) editedExtension else ".$editedExtension"
        return "edited_${serialPadded}__src_${sanitized}${ext}"
    }

    /** Zero-pads [id] to [padding] digits (e.g. id=42, padding=6 → "000042"). */
    fun padSerial(id: Int, padding: Int): String = id.toString().padStart(padding, '0')

    /** Returns the filename without its extension. */
    fun getBaseName(filename: String): String {
        val dot = filename.lastIndexOf('.')
        return if (dot >= 0) filename.substring(0, dot) else filename
    }

    /** Returns the extension without the leading dot, or empty string. */
    fun getExtension(filename: String): String {
        val dot = filename.lastIndexOf('.')
        return if (dot >= 0) filename.substring(dot + 1) else ""
    }
}
