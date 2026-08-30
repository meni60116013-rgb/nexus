export default class ClutchCapacityEngine {
  /**
   * @param {number} engineTorqueNm - Torque máximo del motor (Nm)
   * @param {number} numFrictionPlates - Número de discos de fricción
   * @param {number} outerDiameterMm - Diámetro exterior del disco (mm)
   * @param {number} innerDiameterMm - Diámetro interior del disco (mm)
   * @param {number} numSprings - Número de resortes de opresión
   * @param {number} springForceN - Fuerza ejercida por resorte (N)
   * @param {number} frictionCoeff - Coeficiente de fricción (0.35 húmedo, 0.45 seco)
   */
  calcularCapacidadEmbrague(engineTorqueNm, numFrictionPlates, outerDiameterMm, innerDiameterMm, numSprings, springForceN, frictionCoeff = 0.35) {
    if (engineTorqueNm <= 0 || numFrictionPlates <= 0 || outerDiameterMm <= innerDiameterMm || numSprings <= 0 || springForceN <= 0) {
      return { error: true, msj: 'Parámetros geométricos o de presión inválidos.' };
    }

    const numSurfaces = numFrictionPlates * 2;
    const meanRadiusM = ((outerDiameterMm + innerDiameterMm) / 4) / 1000;
    const totalClampingForceN = numSprings * springForceN;

    // Torque transmitible T = n * mu * F_total * R_medio
    const maxTransmTorqueNm = numSurfaces * frictionCoeff * totalClampingForceN * meanRadiusM;
    const safetyFactor = maxTransmTorqueNm / engineTorqueNm;

    let evaluacion = 'Apto para Uso Diario / Serie';
    if (safetyFactor < 1.15) {
      evaluacion = 'Riesgo Alto de Patinado (Factor < 1.15) - Requiere resortes reforzados o mayor cantidad de discos';
    } else if (safetyFactor >= 1.15 && safetyFactor < 1.4) {
      evaluacion = 'Margen Estándar Calle / Recomendado (Factor 1.15 - 1.4)';
    } else if (safetyFactor >= 1.4 && safetyFactor < 1.8) {
      evaluacion = 'Reforzado / Soportará Salidas Rápidas y Track Day (Factor 1.4 - 1.8)';
    } else {
      evaluacion = 'Competición / Embrague Sobredimensionado (Factor > 1.8) - Tacto de maneta exigente';
    }

    return {
      error: false,
      maxTransmTorqueNm: maxTransmTorqueNm.toFixed(2),
      safetyFactor: safetyFactor.toFixed(2),
      totalClampingForceN: totalClampingForceN.toFixed(1),
      meanRadiusMm: (meanRadiusM * 1000).toFixed(1),
      evaluacion
    };
  }
}
