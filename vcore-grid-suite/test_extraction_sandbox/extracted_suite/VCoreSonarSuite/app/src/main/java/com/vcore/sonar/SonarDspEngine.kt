package com.vcore.sonar

import kotlin.math.sqrt

class SonarDspEngine {
    fun computeCrossCorrelation(leftChannel: ShortArray, rightChannel: ShortArray): CrossCorrelationResult {
        val n = minOf(leftChannel.size, rightChannel.size)
        if (n == 0) return CrossCorrelationResult(0, 0f)
        val maxLag = n / 4 
        var bestLag = 0
        var maxCorrelation = -1f
        var sumLeftSq = 0.0
        var sumRightSq = 0.0
        for (i in 0 until n) {
            sumLeftSq += leftChannel[i] * leftChannel[i]
            sumRightSq += rightChannel[i] * rightChannel[i]
        }
        val denominator = sqrt(sumLeftSq * sumRightSq)
        if (denominator == 0.0) return CrossCorrelationResult(0, 0f)
        for (lag in -maxLag..maxLag) {
            var dotProduct = 0.0
            val startL = maxOf(0, -lag)
            val endL = minOf(n, n - lag)
            for (i in startL until endL) dotProduct += leftChannel[i] * rightChannel[i + lag]
            val correlation = (dotProduct / denominator).toFloat()
            if (correlation > maxCorrelation) {
                maxCorrelation = correlation
                bestLag = lag
            }
        }
        return CrossCorrelationResult(bestLag, maxCorrelation)
    }
    data class CrossCorrelationResult(val lagSamples: Int, val confidenceScore: Float)
}