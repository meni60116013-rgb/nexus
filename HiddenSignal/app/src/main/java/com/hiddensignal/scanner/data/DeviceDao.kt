package com.hiddensignal.scanner.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface DeviceDao {
    @Query("SELECT * FROM devices ORDER BY lastSeen DESC")
    fun observeAll(): Flow<List<DeviceEntity>>

    @Query("SELECT * FROM devices WHERE isWhitelisted = 1 ORDER BY label ASC")
    fun observeWhitelist(): Flow<List<DeviceEntity>>

    @Query("SELECT * FROM devices WHERE address = :address LIMIT 1")
    suspend fun findByAddress(address: String): DeviceEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(device: DeviceEntity)

    @Query("UPDATE devices SET isWhitelisted = :whitelisted, label = :label WHERE address = :address")
    suspend fun setWhitelisted(address: String, whitelisted: Boolean, label: String?)

    @Query("DELETE FROM devices WHERE lastSeen < :beforeTimestamp AND isWhitelisted = 0")
    suspend fun purgeOld(beforeTimestamp: Long)
}
