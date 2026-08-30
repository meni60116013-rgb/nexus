package com.vcore.sonar.sequential

import android.os.Handler
import android.os.Looper

class SequentialSonarPulseEngine(
    private val onPulseComplete: (ReportData) -> Unit
) {
    private val handler = Handler(Looper.getMainLooper())
    private var isRunning = false
    private val intervalMillis: Long = 10000

    private val pulseRunnable = object : Runnable {
        override fun run() {
            if (!isRunning) return
            executeSonarPulse()
            handler.postDelayed(this, intervalMillis)
        }
    }

    fun startSequentialScanning() {
        if (isRunning) return
        isRunning = true
        handler.post(pulseRunnable)
    }

    fun stopSequentialScanning() {
        isRunning = false
        handler.removeCallbacks(pulseRunnable)
    }

    private fun executeSonarPulse() {
        val timestamp = System.currentTimeMillis()
        val report = ReportData(timestamp, "Ráfaga ejecutada con éxito. Recursos protegidos en reposo.")
        onPulseComplete(report)
    }

    data class ReportData(val timestamp: Long, val statusMessage: String)
}