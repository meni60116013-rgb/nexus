package com.vcore.sonar.sequential

import android.util.Log

/**
 * Ejecutor en Vivo de Funciones - VCORE GRID SUITE
 * Autoría: Manuel de Jesús Ovalle Carrillo
 */
object SequentialRunner {
    private const val TAG = "VCoreLiveRunner"

    fun executeLiveSimulation() {
        Log.d(TAG, "=== INICIANDO SIMULACIÓN EN VIVO DE FUNCIONES ===")
        val stressTest = SequentialStressTest()
        stressTest.runSimulationLoop(50)
        Log.d(TAG, "=== SIMULACIÓN EN VIVO CONCLUIDA EXITOSAMENTE ===")
    }
}
