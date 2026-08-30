export default class PistonSpeedEngine {
  /**
   * @param {number} strokeMm - Carrera del pistón en mm
   * @param {number} rodMm - Longitud de biela entre centros en mm
   * @param {number} maxRpm - Régimen máximo de giro (RPM)
   */
  calcularCinematicaPiston(strokeMm, rodMm, maxRpm) {
    if (strokeMm <= 0 || rodMm <= 0 || maxRpm <= 0) {
      return { error: true, msj: 'Parámetros cinemáticos inválidos.' };
    }

    const strokeM = strokeMm / 1000;
    const rodM = rodMm / 1000;

    // Velocidad Media del Pistón (MPS) = (2 * Stroke * RPM) / 60
    const meanPistonSpeedMs = (strokeM * maxRpm) / 30;

    // Relación Biela / Carrera
    const rodToStrokeRatio = rodMm / strokeMm;

    // Aceleración Máxima en PMS: A_max = omega^2 * R * (1 + R/L)
    const omega = (2 * Math.PI * maxRpm) / 60;
    const crankRadiusM = strokeM / 2;
    const maxAccelMs2 = Math.pow(omega, 2) * crankRadiusM * (1 + (crankRadiusM / rodM));
    const maxAccelG = maxAccelMs2 / 9.80665;

    let evalVelocidad = 'Conservador / Larga Duración (<15 m/s)';
    if (meanPistonSpeedMs >= 15 && meanPistonSpeedMs < 20) {
      evalVelocidad = 'Rango Deportivo Estándar (15 - 20 m/s)';
    } else if (meanPistonSpeedMs >= 20 && meanPistonSpeedMs < 25) {
      evalVelocidad = 'Alto Rendimiento / Requiere Pistón Forjado (20 - 25 m/s)';
    } else if (meanPistonSpeedMs >= 25) {
      evalVelocidad = 'Límite Crítico Competición (>25 m/s) - Riesgo Fatiga Extrema';
    }

    let evalRatio = 'Relación Biela/Carrera Equilibrada (1.6 - 1.8)';
    if (rodToStrokeRatio < 1.5) {
      evalRatio = 'Biela Corta (<1.5): Alto empuje lateral, mayor desgaste de falda';
    } else if (rodToStrokeRatio > 1.9) {
      evalRatio = 'Biela Larga (>1.9): Menor fricción lateral, excelente llenado a alto RPM';
    }

    return {
      error: false,
      meanPistonSpeedMs: meanPistonSpeedMs.toFixed(2),
      rodToStrokeRatio: rodToStrokeRatio.toFixed(2),
      maxAccelMs2: maxAccelMs2.toFixed(1),
      maxAccelG: maxAccelG.toFixed(0),
      evalVelocidad,
      evalRatio
    };
  }
}
