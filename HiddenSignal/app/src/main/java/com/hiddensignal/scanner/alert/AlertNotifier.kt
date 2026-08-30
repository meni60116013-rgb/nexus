package com.hiddensignal.scanner.alert

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import com.hiddensignal.scanner.data.DeviceEntity

class AlertNotifier(private val context: Context) {

    private val manager = context.getSystemService(NotificationManager::class.java)

    init {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            manager.createNotificationChannel(
                NotificationChannel(CHANNEL_ID, "Alertas de seguimiento", NotificationManager.IMPORTANCE_HIGH)
            )
        }
    }

    fun notifySuspicious(device: DeviceEntity) {
        val name = device.name ?: device.address
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("Dispositivo sospechoso cerca de ti")
            .setContentText("\"$name\" apareció varias veces en momentos distintos. Revísalo en el historial.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        manager.notify(device.address.hashCode(), notification)
    }

    companion object {
        private const val CHANNEL_ID = "follow_alerts"
    }
}
