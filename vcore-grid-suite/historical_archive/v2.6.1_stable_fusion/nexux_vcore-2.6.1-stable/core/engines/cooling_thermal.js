export const coolingEngine = {
  calcularEnfriamiento: function(potenciaHp, tempAmbienteC, eficienciaRadiador = 0.85) {
    const calorGeneradoKw = potenciaHp * 0.7457 * 1.5;
    const flujoRefrigeranteLpm = (calorGeneradoKw * 60) / (4.184 * 15);
    const areaRadiadorCm2 = (calorGeneradoKw * 1000) / (0.05 * (90 - tempAmbienteC) * eficienciaRadiador);
    return {
      calorKw: calorGeneradoKw.toFixed(1),
      caudalLpm: flujoRefrigeranteLpm.toFixed(1),
      areaRadiador: areaRadiadorCm2.toFixed(0)
    };
  }
};
