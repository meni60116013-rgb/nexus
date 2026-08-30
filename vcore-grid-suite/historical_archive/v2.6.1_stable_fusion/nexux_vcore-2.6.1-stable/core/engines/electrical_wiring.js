export default class ElectricalWiringEngine {
  /**
   * @param {number} watts - Consumo total de la carga (W)
   * @param {number} volts - Voltaje del sistema (ej. 12V o 14.4V en carga)
   * @param {number} lengthMeters - Longitud ida y vuelta del cableado (m)
   * @param {number} maxVoltageDropPercent - Caída de voltaje máxima permitida (%)
   */
  calcularCableado(watts, volts = 12, lengthMeters = 2, maxVoltageDropPercent = 3) {
    if (watts <= 0 || volts <= 0 || lengthMeters <= 0) {
      return { error: true, msj: 'Parámetros eléctricos inválidos.' };
    }

    // Corriente (I = P / V)
    const amperes = watts / volts;

    // Resisitividad del cobre (rho = 0.0175 ohm*mm²/m)
    const rho = 0.0175;
    const maxDropVolts = volts * (maxVoltageDropPercent / 100);

    // Sección mínima mm² = (2 * L * I * rho) / V_drop
    const minSectionMm2 = (lengthMeters * amperes * rho) / maxDropVolts;

    // Fusible recomendado (125% - 150% de la corriente nominal)
    const recommendedFuseAmp = Math.ceil((amperes * 1.35) / 5) * 5;

    // Determinación de Calibre AWG aprox.
    let awg = 'AWG 18';
    if (minSectionMm2 > 13.3) awg = 'AWG 6 o superior';
    else if (minSectionMm2 > 8.36) awg = 'AWG 8';
    else if (minSectionMm2 > 5.26) awg = 'AWG 10';
    else if (minSectionMm2 > 3.31) awg = 'AWG 12';
    else if (minSectionMm2 > 2.08) awg = 'AWG 14';
    else if (minSectionMm2 > 1.31) awg = 'AWG 16';

    return {
      error: false,
      amperes: amperes.toFixed(2),
      minSectionMm2: minSectionMm2.toFixed(2),
      awg,
      recommendedFuseAmp
    };
  }
}
