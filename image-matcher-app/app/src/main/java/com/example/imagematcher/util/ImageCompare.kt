package com.example.imagematcher.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import java.security.MessageDigest

enum class CompareResult {
    IDENTICAL, VERY_SIMILAR, DIFFERENT
}

data class CompareOutput(
    val result: CompareResult,
    val score: Float  // 0.0 (totally different) .. 1.0 (identical)
)

/**
 * Compares two images using a two-stage strategy:
 *  1. Byte-level: if size + SHA-256 match => IDENTICAL.
 *  2. Perceptual: dHash on a 256px-scaled thumbnail; hamming distance determines similarity.
 *
 * A similarity score >= 0.95 is labelled VERY_SIMILAR (likely not edited).
 * The threshold can be tuned without changing the API.
 */
object ImageCompare {

    private const val VERY_SIMILAR_THRESHOLD = 0.95f

    fun compareImages(context: Context, uri1: Uri, uri2: Uri): CompareOutput {
        // Stage 1 – exact byte match
        val size1 = getFileSize(context, uri1)
        val size2 = getFileSize(context, uri2)
        if (size1 > 0 && size1 == size2) {
            val hash1 = sha256(context, uri1)
            val hash2 = sha256(context, uri2)
            if (hash1 != null && hash1 == hash2) {
                return CompareOutput(CompareResult.IDENTICAL, 1.0f)
            }
        }

        // Stage 2 – perceptual dHash
        val bmp1 = loadResizedBitmap(context, uri1, 256)
            ?: return CompareOutput(CompareResult.DIFFERENT, 0f)
        val bmp2 = loadResizedBitmap(context, uri2, 256)
            ?: run { bmp1.recycle(); return CompareOutput(CompareResult.DIFFERENT, 0f) }

        val dHash1 = dHash(bmp1)
        val dHash2 = dHash(bmp2)
        bmp1.recycle()
        bmp2.recycle()

        val distance = hammingDistance(dHash1, dHash2)
        val similarity = 1f - distance.toFloat() / dHash1.size

        return when {
            similarity >= VERY_SIMILAR_THRESHOLD ->
                CompareOutput(CompareResult.VERY_SIMILAR, similarity)
            else ->
                CompareOutput(CompareResult.DIFFERENT, similarity)
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private fun getFileSize(context: Context, uri: Uri): Long = try {
        context.contentResolver.openFileDescriptor(uri, "r")?.use { it.statSize } ?: -1L
    } catch (_: Exception) { -1L }

    private fun sha256(context: Context, uri: Uri): String? = try {
        context.contentResolver.openInputStream(uri)?.use { stream ->
            val digest = MessageDigest.getInstance("SHA-256")
            val buffer = ByteArray(8192)
            var read: Int
            while (stream.read(buffer).also { read = it } != -1) {
                digest.update(buffer, 0, read)
            }
            digest.digest().joinToString("") { "%02x".format(it) }
        }
    } catch (_: Exception) { null }

    private fun loadResizedBitmap(context: Context, uri: Uri, maxSize: Int): Bitmap? = try {
        // First pass: read dimensions only
        val opts = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, opts) }

        val sampleSize = calculateInSampleSize(opts.outWidth, opts.outHeight, maxSize)
        val decodeOpts = BitmapFactory.Options().apply {
            inSampleSize = sampleSize
            inPreferredConfig = Bitmap.Config.ARGB_8888
        }
        context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, decodeOpts) }
    } catch (_: Exception) { null }

    private fun calculateInSampleSize(width: Int, height: Int, maxSize: Int): Int {
        var sample = 1
        while ((width / sample) > maxSize || (height / sample) > maxSize) sample *= 2
        return sample
    }

    /**
     * Difference Hash (dHash):
     * Scales to 9×8, computes 64-bit hash by comparing adjacent horizontal pixels.
     */
    private fun dHash(bitmap: Bitmap): BooleanArray {
        val scaled = Bitmap.createScaledBitmap(bitmap, 9, 8, true)
        val hash = BooleanArray(64)
        var idx = 0
        for (y in 0 until 8) {
            for (x in 0 until 8) {
                hash[idx++] = luminance(scaled.getPixel(x, y)) < luminance(scaled.getPixel(x + 1, y))
            }
        }
        scaled.recycle()
        return hash
    }

    private fun luminance(pixel: Int): Float {
        val r = (pixel shr 16 and 0xFF) / 255f
        val g = (pixel shr 8  and 0xFF) / 255f
        val b = (pixel        and 0xFF) / 255f
        return 0.299f * r + 0.587f * g + 0.114f * b
    }

    private fun hammingDistance(a: BooleanArray, b: BooleanArray): Int {
        var d = 0
        for (i in a.indices) if (a[i] != b[i]) d++
        return d
    }
}
