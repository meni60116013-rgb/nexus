package com.hiddensignal.scanner.scan

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.wifi.WifiManager

/**
 * Escanea redes/puntos de acceso WiFi cercanos (útil para detectar hotspots
 * ocultos, hardware de vigilancia con salida WiFi, etc.). Usa el registro
 * estándar de Android: pedir escaneo + escuchar el broadcast de resultados.
 */
class WifiScanner(
    private val context: Context,
    private val onDeviceFound: (address: String, name: String?, rssi: Int) -> Unit
) {
    private val wifiManager = context.applicationContext
        .getSystemService(Context.WIFI_SERVICE) as WifiManager

    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            val success = intent.getBooleanExtra(WifiManager.EXTRA_RESULTS_UPDATED, false)
            if (!success) return
            @Suppress("MissingPermission")
            wifiManager.scanResults.forEach { result ->
                onDeviceFound(result.BSSID, result.SSID.ifBlank { null }, result.level)
            }
        }
    }

    private var registered = false

    fun start() {
        if (!registered) {
            context.registerReceiver(receiver, IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION))
            registered = true
        }
        @Suppress("MissingPermission", "DEPRECATION")
        wifiManager.startScan()
    }

    fun stop() {
        if (registered) {
            context.unregisterReceiver(receiver)
            registered = false
        }
    }
}
