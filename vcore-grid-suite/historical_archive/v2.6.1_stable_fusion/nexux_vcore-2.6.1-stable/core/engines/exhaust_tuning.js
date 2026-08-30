export default class ExhaustTuningEngine {
  /**
   * @param {number} ccUnitaria - Cilindrada por cilindro (cc)
   * @param {number} targetRpm - RPM objetivo de resonancia / torque máximo
   * @param {number} exhaustDurationDeg - Duración de apertura de levas de escape (grados)
   */
  calcularEscape(ccUnitaria, targetRpm, exhaustDurationDeg = 240) {
    if (ccUnitaria <= 0 || targetRpm <= 0 || exhaustDurationDeg <= 0) {
      return { error: true, msj: 'Parámetros de escape inválidos.' };
    }

    // Longitud primaria ideal L (mm) = ((Duración * 850 * 25.4) / RPM) - 76.2
    const lengthMm = ((exhaustDurationDeg * 850 * 25.4) / targetRpm) - 76.2;

    // Diámetro interno óptimo D (mm)
    const innerDiameterMm = Math.sqrt((ccUnitaria * targetRpm) / 185000) * 10;

    return {
      error: false,
      lengthMm: Math.max(100, lengthMm).toFixed(1),
      lengthCm: (Math.max(100, lengthMm) / 10).toFixed(1),
      innerDiameterMm: innerDiameterMm.toFixed(1)
    };
  }
}
