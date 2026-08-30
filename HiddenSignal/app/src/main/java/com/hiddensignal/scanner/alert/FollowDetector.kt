package com.hiddensignal.scanner.alert

import com.hiddensignal.scanner.data.SightingEntity

/**
 * Heurística de "me está siguiendo": un dispositivo desconocido que
 * aparece en al menos [minClusters] momentos distintos, separados entre
 * sí por al menos [gapMillis] de silencio, dentro de la ventana analizada.
 *
 * La idea: si algo está pegado a ti (en tu mochila, tu auto, tu ropa),
 * lo vas a captar de forma intermitente conforme te alejas/acercas del
 * rango de escaneo — eso se ve como "ráfagas" separadas en el tiempo,
 * no como una señal continua (que sería solo un vecino con wifi fijo).
 */
object FollowDetector {

    private const val GAP_MILLIS = 15 * 60 * 1000L // 15 min de silencio = nueva "ráfaga"
    private const val MIN_CLUSTERS = 3

    fun isSuspicious(sightings: List<SightingEntity>): Boolean {
        if (sightings.size < MIN_CLUSTERS) return false
        val sorted = sightings.sortedBy { it.timestamp }

        var clusters = 1
        for (i in 1 until sorted.size) {
            val gap = sorted[i].timestamp - sorted[i - 1].timestamp
            if (gap > GAP_MILLIS) clusters++
        }
        return clusters >= MIN_CLUSTERS
    }
}
