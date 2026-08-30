export default class DynamicCompressionEngine {
  /**
   * @param {number} staticCR - Relación de compresión estática (ej. 10.5)
   * @param {number} strokeMm - Carrera del pistón (mm)
   * @param {number} rodLengthMm - Longitud de biela entre centros (mm)
   * @param {number} abdcDeg - Ángulo de cierre de admisión después del PMI (° ABDC)
   */
  calcularDCR(staticCR, strokeMm, rodLengthMm, abdcDeg) {
    if (staticCR <= 1 || strokeMm <= 0 || rodLengthMm <= 0 || abdcDeg < 0) {
      return { error: true, msj: 'Parámetros de compresión dinámicos inválidos.' };
    }

    const R = strokeMm / 2; // Radio de manivela
    const L = rodLengthMm;
    const rad = (abdcDeg * Math.PI) / 180;

    // Altura del pistón desde PMI al cerrar la válvula de admisión
    const heightFromBDC = R * (1 - Math.cos(rad)) + L - Math.sqrt(Math.pow(L, 2) - Math.pow(R * Math.sin(rad), 2));
    
    // Carrera efectiva útil
    const effectiveStroke = Math.max(1, strokeMm - heightFromBDC);
    
    // Relación de compresión dinámica (DCR)
    const dcr = ((staticCR - 1) * (effectiveStroke / strokeMm)) + 1;

    // Presión dinámica estimada en frío/arranque (PSI aprox., con n=1.25)
    const dynamicPressurePsi = 14.7 * Math.pow(dcr, 1.25);

    let octanajeRecomendado = 'Gasolina Regular (87 Octanos)';
    if (dcr >= 8.8) octanajeRecomendado = 'Gasolina Premium (>91 Octanos)';
    if (dcr >= 9.8) octanajeRecomendado = 'Alto Octanaje / Combustible de Carrera (>100 Octanos)';

    return {
      error: false,
      effectiveStrokeMm: effectiveStroke.toFixed(2),
      dcr: dcr.toFixed(2),
      estimatedPsi: dynamicPressurePsi.toFixed(1),
      octanajeRecomendado
    };
  }
}
