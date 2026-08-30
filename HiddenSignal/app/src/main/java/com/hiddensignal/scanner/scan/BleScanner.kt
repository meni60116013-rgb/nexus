package com.hiddensignal.scanner.scan

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context

/**
 * Escanea dispositivos Bluetooth Low Energy cercanos (rastreadores tipo
 * AirTag/Tile, auriculares, cámaras BLE, etc.) y reporta cada hallazgo
 * vía el callback [onDeviceFound].
 */
class BleScanner(
    context: Context,
    private val onDeviceFound: (address: String, name: String?, rssi: Int) -> Unit
) {
    private val adapter = BluetoothAdapter.getDefaultAdapter()
    private val leScanner get() = adapter?.bluetoothLeScanner

    private val callback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            val device = result.device
            onDeviceFound(device.address, result.scanRecord?.deviceName, result.rssi)
        }

        override fun onBatchScanResults(results: MutableList<ScanResult>) {
            results.forEach { r ->
                onDeviceFound(r.device.address, r.scanRecord?.deviceName, r.rssi)
            }
        }

        override fun onScanFailed(errorCode: Int) {
            // El caller decide cómo reportar el fallo (permiso denegado,
            // BLE apagado, demasiadas apps escaneando, etc.)
        }
    }

    @SuppressLint("MissingPermission")
    fun start() {
        if (adapter?.isEnabled != true) return
        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_BALANCED)
            .build()
        leScanner?.startScan(null, settings, callback)
    }

    @SuppressLint("MissingPermission")
    fun stop() {
        leScanner?.stopScan(callback)
    }
}
