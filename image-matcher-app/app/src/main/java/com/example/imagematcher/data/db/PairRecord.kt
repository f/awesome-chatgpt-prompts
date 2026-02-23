package com.example.imagematcher.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Represents a completed pairing operation stored in the local database.
 *
 * [id] is auto-generated and serves as the serial number for file renaming.
 * [compareResult] is one of "IDENTICAL", "VERY_SIMILAR", or "DIFFERENT".
 * [compareScore] is a float in [0,1] representing perceptual similarity (1 = identical).
 */
@Entity(tableName = "pair_records")
data class PairRecord(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val createdAt: Long,
    val sourceUri: String,
    val editedUriBefore: String,
    val sourceUriAfter: String = "",
    val editedUriAfter: String = "",
    val editedNewFilename: String = "",
    val compareResult: String = "",
    val compareScore: Float? = null
)
