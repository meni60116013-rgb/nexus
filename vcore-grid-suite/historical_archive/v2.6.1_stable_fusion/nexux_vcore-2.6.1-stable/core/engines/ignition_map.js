export default class IgnitionTimingEngine {
  /**
   * @param {number} rpm - RPM actuales del motor
   * @param {number} dcr - Compresión Dinámica (DCR x.x:1)
   * @param {number} octane - Octanaje del combustible (RON/MON o AKI)
   * @param {number} intakeTempC - Temperatura de aire de admisión (°C)
   * @param {number} coilInductanceMh - Inductancia de la bobina (mH)
   * @param {number} systemVoltage - Voltaje del sistema eléctrico (V)
   */
  calcularAvanceEncendido(rpm, dcr, octane = 95, intakeTempC = 30, coilInductanceMh = 3.5, systemVoltage = 13.5) {
    if (rpm <= 0 || dcr <= 0 || octane <= 0 || systemVoltage <= 0) {
      return { error: true, msj: 'Parámetros de entrada fuera de rango.' };
    }

    // Base de avance según velocidad angular (curva empírica refinada)
    let baseTimingBDTC = 10 + (rpm / 1000) * 2.8;
    if (rpm > 7000) {
      baseTimingBDTC = 10 + (7000 / 1000) * 2.8 + ((rpm - 7000) / 1000) * 1.2;
    }

    // Corrección por Compresión Dinámica
    const dcrCorrection = (dcr - 8.5) * -1.8;

    // Corrección por Octanaje (Base 95 RON)
    const octaneCorrection = (octane - 95) * 0.45;

    // Corrección por Temperatura de Admisión
    let tempCorrection = 0;
    if (intakeTempC > 40) {
      tempCorrection = -((intakeTempC - 40) * 0.15);
    }

    const avanceCalculado = baseTimingBDTC + dcrCorrection + octaneCorrection + tempCorrection;
    const avanceFinal = Math.min(Math.max(avanceCalculado, 5), 42); // Límites mecánicos seguros (5° a 42°)

    // Cálculo de Dwell Time (ms) T = L * I / V
    const targetCurrentA = 6.5; // Corriente de carga nominal de bobina
    const dwellTimeMs = (coilInductanceMh * targetCurrentA) / systemVoltage;

    // Evaluación de Margen de Detonación (Knock Limit)
    let riesgoKnock = 'Bajo (Zona Segura)';
    if (avanceCalculado > 36 && octane < 92) {
      riesgoKnock = 'ALTO - Riesgo Severo de Detonación / Autoencendido';
    } else if (avanceCalculado > 32 || intakeTempC > 55) {
      riesgoKnock = 'Moderado - Monitorear Sensor de Knock / Retrasar 2°';
    }

    return {
      error: false,
      avanceFinalBDTC: avanceFinal.toFixed(1),
      dwellTimeMs: dwellTimeMs.toFixed(2),
      correccionDCR: dcrCorrection.toFixed(1),
      correccionOctano: octaneCorrection.toFixed(1),
      correccionTemp: tempCorrection.toFixed(1),
      riesgoKnock
    };
  }
}
