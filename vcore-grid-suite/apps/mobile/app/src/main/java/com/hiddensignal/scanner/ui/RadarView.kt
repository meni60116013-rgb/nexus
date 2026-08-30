package com.hiddensignal.scanner.ui

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import com.hiddensignal.scanner.data.DeviceEntity
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

/**
 * Dibuja el radar: círculos concéntricos, línea de barrido animada,
 * y un punto por cada dispositivo detectado. La distancia al centro
 * se calcula a partir del RSSI (más negativo = más lejos); el ángulo
 * es estable por dispositivo (hash de su address) para que no "salte"
 * de posición entre refrescos.
 */
class RadarView @JvmOverloads constructor(
    context: Context, attrs: AttributeSet? = null
) : View(context, attrs) {

    private var devices: List<DeviceEntity> = emptyList()
    private var sweepAngle = 0f

    private val ringPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#1B2A4A")
        style = Paint.Style.STROKE
        strokeWidth = 2f
    }
    private val sweepPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#4DFF6A00")
        style = Paint.Style.FILL
    }
    private val dotPaintKnown = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#2ECC71") // verde: en whitelist
        style = Paint.Style.FILL
    }
    private val dotPaintUnknown = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#FF6A00") // naranja: desconocido
        style = Paint.Style.FILL
    }

    private val sweepAnimator = ValueAnimator.ofFloat(0f, 360f).apply {
        duration = 3000
        repeatCount = ValueAnimator.INFINITE
        interpolator = android.view.animation.LinearInterpolator()
        addUpdateListener {
            sweepAngle = it.animatedValue as Float
            invalidate()
        }
    }

    init { sweepAnimator.start() }

    fun submitDevices(list: List<DeviceEntity>) {
        devices = list
        invalidate()
    }

    override fun onDetachedFromWindow() {
        sweepAnimator.cancel()
        super.onDetachedFromWindow()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val cx = width / 2f
        val cy = height / 2f
        val maxRadius = min(width, height) / 2f - 20f

        // anillos concéntricos (25%, 50%, 75%, 100%)
        for (i in 1..4) {
            canvas.drawCircle(cx, cy, maxRadius * i / 4f, ringPaint)
        }

        // sector de barrido
        val rect = android.graphics.RectF(cx - maxRadius, cy - maxRadius, cx + maxRadius, cy + maxRadius)
        canvas.drawArc(rect, sweepAngle, 30f, true, sweepPaint)

        // dispositivos
        devices.forEach { device ->
            val distanceRatio = rssiToDistanceRatio(device.lastRssi)
            val angle = addressToAngle(device.address)
            val radius = maxRadius * distanceRatio
            val x = cx + radius * cos(Math.toRadians(angle.toDouble())).toFloat()
            val y = cy + radius * sin(Math.toRadians(angle.toDouble())).toFloat()
            val paint = if (device.isWhitelisted) dotPaintKnown else dotPaintUnknown
            canvas.drawCircle(x, y, 10f, paint)
        }
    }

    /** RSSI típico va de -30 (muy cerca) a -100 (muy lejos/débil). */
    private fun rssiToDistanceRatio(rssi: Int): Float {
        val clamped = rssi.coerceIn(-100, -30)
        return 1f - ((clamped + 100) / 70f)
    }

    private fun addressToAngle(address: String): Float =
        (address.hashCode().mod(360)).toFloat()
}
