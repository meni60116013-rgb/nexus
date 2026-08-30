export default class AntiSquatEngine {
  /**
   * @param {number} swingarmLengthMm - Longitud del basculante (mm)
   * @param {number} pivotHeightMm - Altura del pivote del basculante al suelo (mm)
   * @param {number} rearAxleHeightMm - Altura del eje trasero al suelo (mm)
   * @param {number} wheelbaseMm - Distancia entre ejes (mm)
   * @param {number} cgHeightMm - Altura del Centro de Gravedad CG (mm)
   * @param {number} pinonTeeth - Dientes del piñón de ataque
   * @param {number} coronaTeeth - Dientes de la corona trasera
   */
  calcularAntiSquat(swingarmLengthMm, pivotHeightMm, rearAxleHeightMm, wheelbaseMm, cgHeightMm, pinonTeeth = 15, coronaTeeth = 38) {
    if (swingarmLengthMm <= 0 || wheelbaseMm <= 0 || cgHeightMm <= 0) {
      return { error: true, msj: 'Parámetros cinemáticos inválidos.' };
    }

    // Ángulo del basculante con respecto a la horizontal
    const deltaHeight = pivotHeightMm - rearAxleHeightMm;
    const swingarmAngleRad = Math.asin(Math.max(-1, Math.min(1, deltaHeight / swingarmLengthMm)));
    const swingarmAngleDeg = (swingarmAngleRad * 180) / Math.PI;

    // Ángulo de la línea de tiro de la cadena
    const chainAngleDeg = Math.atan(((coronaTeeth - pinonTeeth) * 4) / swingarmLengthMm) * (180 / Math.PI);

    // Estimación del porcentaje de Anti-Squat (%)
    const effectiveAngle = swingarmAngleDeg + chainAngleDeg;
    const antiSquatPercent = (Math.tan((effectiveAngle * Math.PI) / 180) * (wheelbaseMm / cgHeightMm)) * 100;

    let behavior = 'Equilibrado / Neutral (80% - 100%)';
    if (antiSquatPercent > 105) behavior = 'Levantamiento Chasis (Anti-Squat Activo)';
    else if (antiSquatPercent < 75) behavior = 'Hundimiento Excesivo (Pro-Squat)';

    return {
      error: false,
      swingarmAngleDeg: swingarmAngleDeg.toFixed(2),
      antiSquatPercent: antiSquatPercent.toFixed(1),
      behavior
    };
  }
}
