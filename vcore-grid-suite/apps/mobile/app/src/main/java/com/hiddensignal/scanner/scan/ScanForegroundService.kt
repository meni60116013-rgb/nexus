package com.hiddensignal.scanner.scan

import android.app.*
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.hiddensignal.scanner.alert.AlertNotifier
import com.hiddensignal.scanner.alert.FollowDetector
import com.hiddensignal.scanner.data.DeviceRepository
import com.hiddensignal.scanner.data.DeviceType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Servicio en primer plano: mantiene el escaneo WiFi+BLE corriendo aunque
 * la app esté en segundo plano (necesario en Android moderno para no
 * perder detecciones al minimizar). Muestra notificación persistente
 * obligatoria por política del sistema.
 */
class ScanForegroundService : Service() {

    private lateinit var repository: DeviceRepository
    private lateinit var alertNotifier: AlertNotifier
    private lateinit var bleScanner: BleScanner
    private lateinit var wifiScanner: WifiScanner
    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onCreate() {
        super.onCreate()
        repository = DeviceRepository(applicationContext)
        alertNotifier = AlertNotifier(applicationContext)

        bleScanner = BleScanner(applicationContext) { address, name, rssi ->
            scope.launch { handleSighting(address, name, DeviceType.BLE, rssi) }
        }
        wifiScanner = WifiScanner(applicationContext) { address, name, rssi ->
            scope.launch { handleSighting(address, name, DeviceType.WIFI, rssi) }
        }
    }

    /**
     * Registra la detección y, si el dispositivo NO está en la lista
     * blanca, revisa si su historial de avistamientos ya forma un
     * patrón sospechoso (visto varias veces en momentos separados).
     */
    private suspend fun handleSighting(address: String, name: String?, type: DeviceType, rssi: Int) {
        val device = repository.reportSighting(address, name, type, rssi)
        if (device.isWhitelisted) return

        val since = System.currentTimeMillis() - 24 * 60 * 60 * 1000L
        val sightings = repository.getSightingsSince(address, since)
        if (FollowDetector.isSuspicious(sightings)) {
            alertNotifier.notifySuspicious(device)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(
            NOTIF_ID,
            buildNotification(),
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION else 0
        )
        bleScanner.start()
        wifiScanner.start()
        return START_STICKY
    }

    override fun onDestroy() {
        bleScanner.stop()
        wifiScanner.stop()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun buildNotification(): Notification {
        val channelId = "scan_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId, "Escaneo activo", NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Hidden Signal")
            .setContentText("Escaneando dispositivos cercanos…")
            .setSmallIcon(android.R.drawable.ic_menu_search)
            .setOngoing(true)
            .build()
    }

    companion object {
        private const val NOTIF_ID = 1001
    }
}
