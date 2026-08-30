package com.vcore.sonar.sequential

import kotlin.math.sqrt

class LightweightDspEngine {
    fun computeQuickCorrelation(channel: ShortArray): Float {
        if (channel.isEmpty()) return 0f
        var sumSq = 0.0
        for (i in channel.indices) {
            sumSq += channel[i] * channel[i]
        }
        return sqrt(sumSq).toFloat() / channel.size
    }
}