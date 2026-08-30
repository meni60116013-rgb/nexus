package com.hiddensignal.scanner.ui

import android.content.Context
import com.hiddensignal.SensorFusionManager

class RadarSensorBinding(context: Context, private val onAzimuthChanged: (Float) -> Unit) {
    private val sensorManager = SensorFusionManager(context)

    fun start() {
        sensorManager.startListening { azimuth, _, _ ->
            onAzimuthChanged(azimuth)
        }
    }

    fun stop() {
        sensorManager.stopListening()
    }
}
