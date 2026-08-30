export default class IntakeTuningEngine {
  /**
   * @param {number} ccUnitaria - Cilindrada por cilindro (cc)
   * @param {number} targetRpm - RPM objetivo de potencia / torque
   * @param {number} intakeDurationDeg - Duración de apertura de levas de admisión (grados)
   * @param {number} runnerDiameterMm - Diámetro interno del ducto de admisión (mm)
   */
  calcularAdmision(ccUnitaria, targetRpm, intakeDurationDeg = 250, runnerDiameterMm = 30) {
    if (ccUnitaria <= 0 || targetRpm <= 0 || intakeDurationDeg <= 0 || runnerDiameterMm <= 0) {
      return { error: true, msj: 'Parámetros de admisión inválidos.' };
    }

    // Longitud teórica del colector/trompeta de admisión L (mm)
    const lengthMm = ((intakeDurationDeg * 840 * 25.4) / targetRpm) - (runnerDiameterMm / 2);

    // Volumen recomendado de Airbox (Litros) -> Rango de resonancia Helmholtz (18x a 22x V_u)
    const airboxMinLiters = (ccUnitaria * 18) / 1000;
    const airboxOptLiters = (ccUnitaria * 22) / 1000;

    return {
      error: false,
      lengthMm: Math.max(80, lengthMm).toFixed(1),
      lengthCm: (Math.max(80, lengthMm) / 10).toFixed(1),
      airboxMinLiters: airboxMinLiters.toFixed(2),
      airboxOptLiters: airboxOptLiters.toFixed(2)
    };
  }
}
