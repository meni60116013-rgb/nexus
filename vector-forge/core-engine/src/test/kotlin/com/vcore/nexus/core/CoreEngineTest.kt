package com.vcore.nexus.core

import org.junit.Test
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue

class CoreEngineTest {

    private class DummyModule(override val id: String) : EngineModule {
        override val version = "1.0.0"
        override fun healthCheck() = ModuleStatus(ok = true, detail = "dummy ready")
        override fun execute(request: EngineRequest): EngineResponse {
            return if (request.action == "ping")
                EngineResponse(success = true, data = mapOf("pong" to true))
            else
                EngineResponse(success = false, error = "acción desconocida")
        }
    }

    @Test
    fun registraYDespachaCorrectamente() {
        val engine = CoreEngine()
        engine.register(DummyModule("diagnostics"))

        val response = engine.dispatch("diagnostics", EngineRequest("ping"))
        assertTrue(response.success)
        assertEquals(true, response.data["pong"])
    }

    @Test
    fun devuelveErrorSiModuloNoExiste() {
        val engine = CoreEngine()
        val response = engine.dispatch("inexistente", EngineRequest("ping"))
        assertTrue(!response.success)
        assertEquals("Módulo 'inexistente' no registrado", response.error)
    }
}
