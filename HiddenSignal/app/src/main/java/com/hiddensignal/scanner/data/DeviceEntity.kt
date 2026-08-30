package com.hiddensignal.scanner.data

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class DeviceType { WIFI, BLE }

@Entity(tableName = "devices")
data class DeviceEntity(
    @PrimaryKey val address: String,
    val name: String?,
    val type: DeviceType,
    val lastRssi: Int,
    val firstSeen: Long,
    val lastSeen: Long,
    val timesSeen: Int,
    val isWhitelisted: Boolean = false,
    val label: String? = null
)
