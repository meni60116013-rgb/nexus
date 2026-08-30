export default class TubularStrengthEngine {
  /**
   * @param {number} outerDiameterMm - Diámetro exterior (mm)
   * @param {number} wallThicknessMm - Espesor de pared (mm)
   * @param {number} yieldStrengthMpa - Límite elástico en MPa (ej. 355 para Acero Estructural/DOM)
   */
  calcularResistencia(outerDiameterMm, wallThicknessMm, yieldStrengthMpa = 355) {
    if (outerDiameterMm <= 0 || wallThicknessMm <= 0 || outerDiameterMm <= 2 * wallThicknessMm) {
      return { error: true, msj: 'Geometría de tubo inválida.' };
    }

    const dOut = outerDiameterMm;
    const dIn = outerDiameterMm - (2 * wallThicknessMm);

    // Momento de Inercia I = (pi/64) * (D^4 - d^4)
    const inercia = (Math.PI / 64) * (Math.pow(dOut, 4) - Math.pow(dIn, 4));

    // Módulo Resistente / Módulo de Sección Z = I / (D / 2)
    const moduloSeccion = inercia / (dOut / 2);

    // Momento Flector Máximo Admitido (N*m)
    const momentoMaxNm = (moduloSeccion * yieldStrengthMpa) / 1000;

    // Peso estimado por metro (Acero 7850 kg/m³)
    const areaSeccionMm2 = (Math.PI / 4) * (Math.pow(dOut, 2) - Math.pow(dIn, 2));
    const pesoKgM = (areaSeccionMm2 * 0.000001) * 7850;

    return {
      error: false,
      inerciaMm4: inercia.toFixed(2),
      moduloSeccionMm3: moduloSeccion.toFixed(2),
      momentoMaxNm: momentoMaxNm.toFixed(2),
      pesoKgM: pesoKgM.toFixed(2)
    };
  }
}
