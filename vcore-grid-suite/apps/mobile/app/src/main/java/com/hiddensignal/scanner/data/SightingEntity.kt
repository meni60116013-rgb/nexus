package com.hiddensignal.scanner.data

import androidx.room.Entity

/**
 * Cada aparición individual de un dispositivo (no solo la última, como
 * en DeviceEntity). Necesario para el motor de alertas: detectar que un
 * MISMO desconocido aparece en momentos separados es la señal real de
 * que algo te está siguiendo, no solo que está cerca una vez.
 */
@Entity(tableName = "sightings", primaryKeys = ["address", "timestamp"])
data class SightingEntity(
    val address: String,
    val timestamp: Long,
    val rssi: Int
)
