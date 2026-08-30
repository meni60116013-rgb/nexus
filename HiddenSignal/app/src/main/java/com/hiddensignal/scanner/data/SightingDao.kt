package com.hiddensignal.scanner.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface SightingDao {
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(sighting: SightingEntity)

    @Query("SELECT * FROM sightings WHERE address = :address AND timestamp > :since ORDER BY timestamp ASC")
    suspend fun getSince(address: String, since: Long): List<SightingEntity>

    @Query("DELETE FROM sightings WHERE timestamp < :beforeTimestamp")
    suspend fun purgeOld(beforeTimestamp: Long)
}
