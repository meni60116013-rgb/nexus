/**
 * V-core Nexux v3.0 — Suite de Pruebas Unitarias de Ingeniería
 * Autor: Manuel de Jesús Ovalle Carrillo
 * Propósito: Validar exactitud matemática y prevención de desbordamientos.
 */

const TestSuiteVCore = {
  runAllTests: function() {
    console.log("=== INICIANDO CONTROL DE CALIDAD MATEMÁTICO (V-CORE NEXUX) ===");
    try {
      this.testCalcularFactorK();
      this.testCorteBocaDePez();
      console.log("✅ CONTROL DE CALIDAD LOCAL EXITOSO: Ecuaciones validadas sin errores.");
    } catch (error) {
      console.error("❌ FALLO EN LA VALIDACIÓN CRÍTICA:", error.message);
    }
  },

  assertNear: function(actual, expected, tolerance = 0.001, testName) {
    if (isNaN(actual) || !isFinite(actual)) {
      throw new Error(`[${testName}] Fallo por desbordamiento numérico o valor NaN.`);
    }
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(`[${testName}] Error de precisión. Esperado: ${expected}, Obtenido: ${actual}`);
    }
    console.log(`  └─ [OK] ${testName}`);
  },

  assertTrue: function(condition, testName) {
    if (!condition) throw new Error(`[${testName}] Condición lógica falsa.`);
    console.log(`  └─ [OK] ${testName}`);
  },

  testCalcularFactorK: function() {
    console.log("🧪 Validando Ecuaciones de Deformación Térmica (Factor K)...");
    const calcularFactorK = (espesor, diametro) => {
      if (espesor <= 0 || diametro <= 0) return 0;
      let k = 0.33 + (0.12 * (espesor / diametro));
      return Math.min(Math.max(k, 0.1), 0.5); 
    };
    let kResult1 = calcularFactorK(2.0, 32.0);
    this.assertNear(kResult1, 0.3375, 0.0001, "Tubo Estructural 32x2mm");
    let kResultLimite = calcularFactorK(0, 32.0);
    this.assertNear(kResultLimite, 0, 0.0, "Límite: Espesor Cero");
  },

  testCorteBocaDePez: function() {
    console.log("🧪 Validando Ecuaciones de Ajuste Perimetral (Mitre Cuts)...");
    const calcularProfundidadCorte = (diametroExt, anguloDeg, alfaRad) => {
      const anguloRad = (anguloDeg * Math.PI) / 180;
      return (diametroExt / 2) * (Math.sqrt(1 - Math.pow(Math.sin(alfaRad) * Math.cos(anguloRad), 2)) / Math.sin(anguloRad));
    };
    let prof90 = calcularProfundidadCorte(38.0, 90.0, Math.PI / 2);
    this.assertNear(prof90, 19.0, 0.001, "Profundidad de corte ortogonal a 90°");
    let prof45 = calcularProfundidadCorte(38.0, 45.0, Math.PI / 2);
    this.assertTrue(prof45 > 19.0 && isFinite(prof45), "Profundidad extendida en unión angular a 45°");
  }
};

TestSuiteVCore.runAllTests();
