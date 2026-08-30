export default class BrakeHydraulicsEngine {
  /**
   * @param {number} masterPistonMm - Diámetro del émbolo de bomba principal (mm)
   * @param {number} caliperPistonMm - Diámetro del pistón del caliper (mm)
   * @param {number} caliperPistonCount - Cantidad total de pistones en el caliper
   * @param {number} handForceN - Fuerza ejercida en maneta (N) [Aprox 100N = 10kg]
   */
  calcularHidraulicaFrenos(masterPistonMm, caliperPistonMm, caliperPistonCount = 2, handForceN = 100) {
    if (masterPistonMm <= 0 || caliperPistonMm <= 0 || caliperPistonCount <= 0) {
      return { error: true, msj: 'Parámetros hidráulicos inválidos.' };
    }

    const areaMaster = Math.PI * Math.pow(masterPistonMm / 2, 2);
    const areaPistonCaliper = Math.PI * Math.pow(caliperPistonMm / 2, 2);
    const areaTotalCaliper = areaPistonCaliper * caliperPistonCount;

    // Relación hidráulica (Área Caliper / Área Bomba)
    const hydraulicRatio = areaTotalCaliper / areaMaster;

    // Fuerza mecánica amplificada por maneta (Relación mecánica promedio 4:1)
    const leverForceN = handForceN * 4;

    // Presión en la línea hidráulica (P = F / A) en MPa y PSI
    const pressureMpa = leverForceN / areaMaster;
    const pressurePsi = pressureMpa * 145.038;

    // Fuerza total de prensado ejercida en las pastillas (N)
    const clampingForceN = leverForceN * hydraulicRatio;

    return {
      error: false,
      hydraulicRatio: hydraulicRatio.toFixed(2),
      pressureMpa: pressureMpa.toFixed(2),
      pressurePsi: pressurePsi.toFixed(0),
      clampingForceN: clampingForceN.toFixed(1)
    };
  }
}
