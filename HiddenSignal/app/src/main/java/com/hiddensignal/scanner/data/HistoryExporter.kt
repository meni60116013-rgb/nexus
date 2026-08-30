package com.hiddensignal.scanner.data

import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.*

/**
 * Genera un CSV con todo el historial y abre el selector de "Compartir"
 * de Android. Útil para reportar un hallazgo (ej. a la policía, a
 * seguridad de un edificio) o simplemente guardarlo fuera de la app.
 */
object HistoryExporter {

    fun exportAndShare(context: Context, devices: List<DeviceEntity>) {
        val dir = File(context.cacheDir, "exports").apply { mkdirs() }
        val stamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val file = File(dir, "hidden_signal_historial_$stamp.csv")

        FileWriter(file).use { writer ->
            writer.append("direccion,nombre,tipo,ultima_senal_dbm,primera_vez,ultima_vez,veces_visto,conocido,apodo\n")
            val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
            devices.forEach { d ->
                writer.append(
                    listOf(
                        d.address,
                        d.name ?: "",
                        d.type.name,
                        d.lastRssi.toString(),
                        dateFormat.format(Date(d.firstSeen)),
                        dateFormat.format(Date(d.lastSeen)),
                        d.timesSeen.toString(),
                        if (d.isWhitelisted) "si" else "no",
                        d.label ?: ""
                    ).joinToString(",") { field -> "\"${field.replace("\"", "'")}\"" } + "\n"
                )
            }
        }

        val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/csv"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(shareIntent, "Compartir historial"))
    }
}
