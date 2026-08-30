package com.vcore.sonar

import android.hardware.*
import kotlin.math.*

class SpatialFusionEngine(private val sensorManager: SensorManager) : SensorEventListener {
    private var currentAzimuth: Float = 0f
    private val soundSpeedMps: Float = 343.0f
    private val sampleRate: Float = 44100.0f
    private val accelerometerReading = FloatArray(3)
    private val magnetometerReading = FloatArray(3)
    private val rotationMatrix = FloatArray(9)
    private val orientationAngles = FloatArray(3)

    fun startSensors() {
        sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
        sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
    }

    fun stopSensors() { sensorManager.unregisterListener(this) }

    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) System.arraycopy(event.values, 0, accelerometerReading, 0, 3)
        if (event.sensor.type == Sensor.TYPE_MAGNETIC_FIELD) System.arraycopy(event.values, 0, magnetometerReading, 0, 3)
        SensorManager.getRotationMatrix(rotationMatrix, null, accelerometerReading, magnetometerReading)
        SensorManager.getOrientation(rotationMatrix, orientationAngles)
        currentAzimuth = orientationAngles[0]
    }

    override fun onAccuracyChanged(s: Sensor?, a: Int) {}

    fun calculateAnomalyVector(lagSamples: Int, confidenceScore: Float): SpatialVector? {
        if (confidenceScore < 0.65f) return null
        val timeDelaySeconds = lagSamples / sampleRate
        val estimatedDistance = (timeDelaySeconds * soundSpeedMps) / 2.0f
        if (estimatedDistance <= 0f || estimatedDistance > 10.0f) return null
        return SpatialVector(estimatedDistance * sin(currentAzimuth), estimatedDistance * cos(currentAzimuth), estimatedDistance, confidenceScore)
    }

    data class SpatialVector(val relativeX: Float, val relativeY: Float, val distanceMeters: Float, val confidence: Float)
}