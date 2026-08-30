export default class FuelInjectorEngine {
  /**
   * @param {number} targetHp - Potencia objetivo (BHP)
   * @param {number} numInjectors - Número de inyectores en el motor
   * @param {number} maxDutyCycle - Ciclo de trabajo máximo % (ej. 80%)
   * @param {number} bsfc - Consumo específico de combustible (lb/hp*h) - ej. 0.48
   * @param {number} fuelPressureBar - Presión del riel de combustible en Bar (ej. 3.0)
   */
  calcularInyector(targetHp, numInjectors = 1, maxDutyCycle = 80, bsfc = 0.48, fuelPressureBar = 3.0) {
    if (targetHp <= 0 || numInjectors <= 0 || maxDutyCycle <= 0 || bsfc <= 0 || fuelPressureBar <= 0) {
      return { error: true, msj: 'Parámetros de inyección inválidos.' };
    }

    const dutyFraction = maxDutyCycle / 100;
    
    // Caudal en lbs/hr por inyector = (HP * BSFC) / (NumInyectores * DutyCycle)
    const flowLbsHr = (targetHp * bsfc) / (numInjectors * dutyFraction);
    
    // Conversión a cc/min (1 lb/hr ≈ 10.5 cc/min)
    const flowCcMin = flowLbsHr * 10.5;

    // Corrección por presión de combustible (Presión base estándar 3.0 bar / 43.5 psi)
    const basePressureBar = 3.0;
    const pressureCorrection = Math.sqrt(fuelPressureBar / basePressureBar);
    const flowCcMinAdjusted = flowCcMin * pressureCorrection;

    let recomendacion = 'Inyector Capacidad Estándar';
    if (flowCcMinAdjusted < 150) {
      recomendacion = 'Baja Capacidad (100 - 150 cc/min) - Motores 100cc - 150cc Monocilíndricos';
    } else if (flowCcMinAdjusted >= 150 && flowCcMinAdjusted < 300) {
      recomendacion = 'Capacidad Media (150 - 300 cc/min) - Motores 200cc - 400cc / Tuning de Calle';
    } else if (flowCcMinAdjusted >= 300 && flowCcMinAdjusted < 600) {
      recomendacion = 'Alto Flujo (300 - 600 cc/min) - Competición / Motores de Alto Régimen (RPM)';
    } else {
      recomendacion = 'Ultra Flujo (>600 cc/min) - Motores Turbo / Sobrealimentados / E85 (Etanol)';
    }

    return {
      error: false,
      flowLbsHr: flowLbsHr.toFixed(2),
      flowCcMin: flowCcMin.toFixed(1),
      flowCcMinAdjusted: flowCcMinAdjusted.toFixed(1),
      dutyCycle: maxDutyCycle,
      bsfc: bsfc.toFixed(2),
      fuelPressureBar: fuelPressureBar.toFixed(1),
      recomendacion
    };
  }
}
