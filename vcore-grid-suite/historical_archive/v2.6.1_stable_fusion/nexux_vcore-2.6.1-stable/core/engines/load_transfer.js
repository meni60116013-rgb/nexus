export default class LoadTransferEngine {
  /**
   * @param {number} weightKg - Peso total vehículo + piloto (kg)
   * @param {number} wheelbaseMm - Distancia entre ejes / Batalla (mm)
   * @param {number} cgHeightMm - Altura del Centro de Gravedad CG (mm)
   * @param {number} rearBiasPercent - Porcentaje de peso estático en eje trasero (%)
   * @param {number} accelG - Deceleración (-) o Aceleración (+) en Gs
   */
  calcularTransferenciaCarga(weightKg, wheelbaseMm, cgHeightMm, rearBiasPercent = 55, accelG = 0.8) {
    if (weightKg <= 0 || wheelbaseMm <= 0 || cgHeightMm <= 0) {
      return { error: true, msj: 'Parámetros dinámicos inválidos.' };
    }

    const staticRearKg = weightKg * (rearBiasPercent / 100);
    const staticFrontKg = weightKg - staticRearKg;

    // Delta W = (W * G * h) / L
    const transferKg = (weightKg * accelG * cgHeightMm) / wheelbaseMm;

    const dynamicFrontKg = Math.min(weightKg, Math.max(0, staticFrontKg + transferKg));
    const dynamicRearKg = Math.max(0, weightKg - dynamicFrontKg);

    return {
      error: false,
      staticFrontKg: staticFrontKg.toFixed(1),
      staticRearKg: staticRearKg.toFixed(1),
      transferKg: transferKg.toFixed(1),
      dynamicFrontKg: dynamicFrontKg.toFixed(1),
      dynamicRearKg: dynamicRearKg.toFixed(1),
      stoppieRisk: dynamicRearKg <= 0
    };
  }
}
