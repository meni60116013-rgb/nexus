package com.vcore.sonar.sequential

import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager

class SequentialSensorEngine(private val sensorManager: SensorManager) : SensorEventListener {
    private var lastAzimuth: Float = 0f

    fun sampleOrientationOnce() {
        sensorManager.getDefaultSensor(Sensor.TYPE_ORIENTATION)?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
    }

    fun stopSensors() {
        sensorManager.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type == Sensor.TYPE_ORIENTATION) {
            lastAzimuth = event.values[0]
            stopSensors()
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}