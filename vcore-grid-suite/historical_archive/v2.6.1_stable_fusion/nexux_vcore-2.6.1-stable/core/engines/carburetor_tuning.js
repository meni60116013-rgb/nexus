export default class CarburetorTuningEngine {
  /**
   * @param {number} ccUnitaria - Cilindrada por cilindro (cc)
   * @param {number} maxRpm - RPM de potencia máxima
   * @param {number} altitudeMeters - Altitud sobre el nivel del mar (m)
   */
  calcularCarburacion(ccUnitaria, maxRpm, altitudeMeters = 0) {
    if (ccUnitaria <= 0 || maxRpm <= 0) {
      return { error: true, msj: 'Parámetros de entrada inválidos.' };
    }

    // Diámetro óptimo de Venturi (mm) para monocilíndrico 4T: D = 0.82 * sqrt(cc * RPM / 1000)
    const venturiMm = 0.82 * Math.sqrt((ccUnitaria * maxRpm) / 1000);

    // Corrección de densidad de aire por altitud (pérdida aprox. 3% de densidad por cada 1000m)
    const densidadRelativa = Math.max(0.7, 1 - (altitudeMeters / 1000) * 0.035);
    const porcentajeReduccionJet = Math.round((1 - Math.sqrt(densidadRelativa)) * 100);

    return {
      error: false,
      venturiMm: venturiMm.toFixed(1),
      densidadRelativa: densidadRelativa.toFixed(2),
      porcentajeReduccionJet
    };
  }
}
