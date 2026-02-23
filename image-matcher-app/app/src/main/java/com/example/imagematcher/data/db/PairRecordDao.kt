package com.example.imagematcher.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface PairRecordDao {

    /** Inserts a new record and returns the auto-generated row ID (used as serial number). */
    @Insert
    suspend fun insert(record: PairRecord): Long

    /** Updates an existing record (e.g., to fill in URIs after transfer completes). */
    @Update
    suspend fun update(record: PairRecord)

    /** Returns all records ordered by most recent first. */
    @Query("SELECT * FROM pair_records ORDER BY id DESC")
    fun getAllRecords(): Flow<List<PairRecord>>

    @Query("SELECT * FROM pair_records WHERE id = :id")
    suspend fun getById(id: Int): PairRecord?

    @Query("SELECT COUNT(*) FROM pair_records")
    suspend fun count(): Int
}
