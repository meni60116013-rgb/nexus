export default class MetrologiaEngine {
  constructor(kFactor = 0.33) {
    // K-Factor 0.33 calibrado para acero y hierro dulce en taller
    this.kFactor = kFactor;
  }

  calcularBendAllowance(radioInterno, anguloDeg, espesor) {
    const radAngle = (anguloDeg * Math.PI) / 180;
    return radAngle * (radioInterno + (this.kFactor * espesor));
  }

  calcularLongitudPlana(tramoA, tramoB, anguloDeg, espesor, radioInterno = 3.0) {
    const radAngle = (anguloDeg * Math.PI) / 180;
    const osb = Math.tan(radAngle / 2) * (radioInterno + espesor);
    const bendAllowance = this.calcularBendAllowance(radioInterno, anguloDeg, espesor);
    const longitudPlana = tramoA + tramoB - (2 * osb) + bendAllowance;

    return {
      longitudPlana: longitudPlana.toFixed(2),
      bendAllowance: bendAllowance.toFixed(2),
      osb: osb.toFixed(2),
      kFactor: this.kFactor
    };
  }
}
