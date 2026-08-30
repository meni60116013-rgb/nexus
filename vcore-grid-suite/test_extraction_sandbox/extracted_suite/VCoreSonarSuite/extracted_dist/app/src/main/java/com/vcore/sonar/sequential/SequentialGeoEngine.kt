package com.vcore.sonar.sequential

import android.location.Location
import android.os.SystemClock

/**
 * Micronúcleo de Posicionamiento Secuencial (VCORE GRID SUITE)
 * Autoría: Manuel de Jesús Ovalle Carrillo
 * Integración automática de latitud, longitud, altitud y nivel geodésico.
 */
class SequentialGeoEngine {

    private var lastValidAltitude: Double = 0.0
    private var isCalibrated: Boolean = false

    fun processLocationData(location: Location): Map<String, Any> {
        val verticalAccuracy = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            location.verticalAccuracyMeters
        } else {
            0.0f
        }

        if (location.hasAltitude()) {
            lastValidAltitude = location.altitude
            isCalibrated = true
        }

        return mapOf(
            "latitude" to location.latitude,
            "longitude" to location.longitude,
            "altitude" to location.altitude,
            "verticalAccuracy" to verticalAccuracy,
            "horizontalAccuracy" to location.accuracy,
            "isAltitudeCalibrated" to isCalibrated,
            "timestamp" to System.currentTimeMillis(),
            "elapsedRealtimeNanos" to SystemClock.elapsedRealtimeNanos()
        )
    }

    fun clearCache() {
        isCalibrated = false
        lastValidAltitude = 0.0
    }
}
