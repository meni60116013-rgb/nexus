package com.vcore.nexus.core

/** Contrato universal: todo módulo del sistema (diagnóstico, telemetría, ingeniería, etc.)
 *  se conecta al Core Engine implementando este contrato. */
interface EngineModule {
    val id: String
    val version: String
    fun healthCheck(): ModuleStatus
    fun execute(request: EngineRequest): EngineResponse
}

data class ModuleStatus(val ok: Boolean, val detail: String = "")

data class EngineRequest(val action: String, val payload: Map<String, Any?> = emptyMap())

data class EngineResponse(
    val success: Boolean,
    val data: Map<String, Any?> = emptyMap(),
    val error: String? = null
)
