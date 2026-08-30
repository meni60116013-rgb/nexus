export default class GearRatioEngine {
  /**
   * @param {number} rpm - RPM del motor
   * @param {number} teethFront - Dientes del piñón de ataque
   * @param {number} teethRear - Dientes de la corona (sprocket)
   * @param {number} tireDiameterMm - Diámetro total de rueda trasera (mm)
   * @param {number} primaryRatio - Relación primaria interna (por defecto 3.09)
   * @param {number} gearRatio - Relación de la caja/marcha (por defecto 1.0)
   */
  calcularVelocidad(rpm, teethFront, teethRear, tireDiameterMm, primaryRatio = 3.09, gearRatio = 1.0) {
    if (!teethFront || !teethRear || !tireDiameterMm || teethFront <= 0) {
      return { velocidadKmh: '0.00', finalRatio: '0.00', totalRatio: '0.00' };
    }

    const finalDriveRatio = teethRear / teethFront;
    const totalRatio = primaryRatio * gearRatio * finalDriveRatio;
    
    // Circunferencia en metros = (π * D) / 1000
    const tireCircumferenceMeters = (Math.PI * tireDiameterMm) / 1000;
    
    // RPM de la rueda
    const wheelRpm = rpm / totalRatio;
    
    // Velocidad en km/h = (wheelRpm * circunferencia * 60) / 1000
    const velocidadKmh = (wheelRpm * tireCircumferenceMeters * 60) / 1000;

    return {
      velocidadKmh: velocidadKmh.toFixed(1),
      finalRatio: finalDriveRatio.toFixed(2),
      totalRatio: totalRatio.toFixed(2)
    };
  }
}
