export default class SuspensionSpringEngine {
  /**
   * @param {number} wireDiameterMm - Diámetro del alambre d (mm)
   * @param {number} meanDiameterMm - Diámetro medio de la espira D (mm)
   * @param {number} activeCoils - Número de espiras activas (n)
   * @param {number} shearModulusGpa - Módulo de cizallamiento G en GPa (Acero resorte: 79.3)
   */
  calcularTasaResorte(wireDiameterMm, meanDiameterMm, activeCoils, shearModulusGpa = 79.3) {
    if (wireDiameterMm <= 0 || meanDiameterMm <= 0 || activeCoils <= 0) {
      return { error: true, msj: 'Parámetros de resorte inválidos.' };
    }

    const d = wireDiameterMm;
    const D = meanDiameterMm;
    const n = activeCoils;
    const G = shearModulusGpa * 1000; // Conversión a N/mm²

    // Tasa k = (G * d^4) / (8 * D^3 * n) en N/mm
    const rateNmm = (G * Math.pow(d, 4)) / (8 * Math.pow(D, 3) * n);
    const rateKgmm = rateNmm / 9.80665;
    const rateLbin = rateNmm * 5.71015;

    return {
      error: false,
      rateNmm: rateNmm.toFixed(2),
      rateKgmm: rateKgmm.toFixed(2),
      rateLbin: rateLbin.toFixed(1)
    };
  }
}
