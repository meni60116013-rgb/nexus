package com.vcore.sonar

import android.annotation.SuppressLint
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder

class AudioCaptureEngine {
    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private val sampleRate = 44100
    private val channelConfig = AudioFormat.CHANNEL_IN_STEREO
    private val audioFormat = AudioFormat.ENCODING_PCM_16BIT
    private val bufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)

    @SuppressLint("MissingPermission")
    fun startCapture(onAudioDataReady: (ShortArray, ShortArray) -> Unit) {
        if (isRecording) return
        audioRecord = AudioRecord(MediaRecorder.AudioSource.MIC, sampleRate, channelConfig, audioFormat, bufferSize)
        audioRecord?.startRecording()
        isRecording = true
        Thread {
            val shortBuffer = ShortArray(bufferSize / 2)
            val leftChannel = ShortArray(bufferSize / 4)
            val rightChannel = ShortArray(bufferSize / 4)
            while (isRecording) {
                val readSize = audioRecord?.read(shortBuffer, 0, shortBuffer.size) ?: 0
                if (readSize > 0) {
                    var lIndex = 0
                    var rIndex = 0
                    for (i in 0 until readSize step 2) {
                        if (i < shortBuffer.size && i + 1 < shortBuffer.size) {
                            leftChannel[lIndex++] = shortBuffer[i]
                            rightChannel[rIndex++] = shortBuffer[i + 1]
                        }
                    }
                    onAudioDataReady(leftChannel, rightChannel)
                }
            }
        }.start()
    }

    fun stopCapture() {
        isRecording = false
        audioRecord?.stop()
        audioRecord?.release()
        audioRecord = null
    }
}