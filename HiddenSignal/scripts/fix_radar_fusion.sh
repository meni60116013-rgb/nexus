#!/bin/bash
set -e

echo "=== [1/2] Generando vinculación de sensores ==="
mkdir -p app/src/main/java/com/hiddensignal/scanner/ui/

cat << 'KOTLIN' > app/src/main/java/com/hiddensignal/scanner/ui/RadarSensorBinding.kt
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
KOTLIN

echo "=== [2/2] Enviando parche a GitHub ==="
git add .
git commit -m "fix(ui): vinculacion directa de SensorFusionManager con la rotacion del radar"
git push origin main

echo "=== ¡Parche enviado correctamente! GitHub Actions volverá a compilar ==="
