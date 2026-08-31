package com.vcore.nexus.core

/** Núcleo de ejecución: registra módulos y enruta requests hacia ellos.
 *  No implementa lógica de negocio: solo contratos, registro y despacho. */
class CoreEngine {
    private val modules = mutableMapOf<String, EngineModule>()

    fun register(module: EngineModule) {
        modules[module.id] = module
    }

    fun unregister(moduleId: String) {
        modules.remove(moduleId)
    }

    fun listModules(): List<String> = modules.keys.toList()

    fun statusAll(): Map<String, ModuleStatus> =
        modules.mapValues { it.value.healthCheck() }

    fun dispatch(moduleId: String, request: EngineRequest): EngineResponse {
        val module = modules[moduleId]
            ?: return EngineResponse(success = false, error = "Módulo '$moduleId' no registrado")
        return try {
            module.execute(request)
        } catch (e: Exception) {
            EngineResponse(success = false, error = "Fallo en '$moduleId': ${e.message}")
        }
    }
}
