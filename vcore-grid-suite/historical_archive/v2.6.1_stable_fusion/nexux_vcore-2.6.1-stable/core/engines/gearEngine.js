export const gearEngine = {
  calcularTransmision: function(dientesPinon, dientesCorona, rpmMotor, radioRuedaMm) {
    const relacion = dientesCorona / dientesPinon;
    const rpmRueda = rpmMotor / relacion;
    const perimetroM = (2 * Math.PI * (radioRuedaMm / 1000));
    const velocidadKmh = (rpmRueda * perimetroM * 60) / 1000;
    return {
      relacionRatio: relacion.toFixed(2),
      rpmRueda: rpmRueda.toFixed(0),
      velocidadKmh: velocidadKmh.toFixed(1)
    };
  }
};
