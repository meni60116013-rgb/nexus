package com.vcore.grid.suite.telemetry

class NativeBridge {
    init {
        System.loadLibrary("vcore_native")
    }
    external fun parseRpm(payload: ByteArray): Float
}
