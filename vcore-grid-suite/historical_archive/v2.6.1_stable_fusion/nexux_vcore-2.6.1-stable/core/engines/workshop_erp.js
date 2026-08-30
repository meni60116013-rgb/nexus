// V-CORE SENTINEL // Motor ERP de Cotización y Taller
export const workshopERP = {
  calcularPresupuesto: function(metrosTubo, horasSoldadura, costoMetroTubo = 12, costoHoraSoldador = 25) {
    const costoMaterial = metrosTubo * costoMetroTubo;
    const costoManoObra = horasSoldadura * costoHoraSoldador;
    const insumosConsumibles = costoManoObra * 0.15; // 15% gas, microalambre/TIG y discos
    const totalUSD = costoMaterial + costoManoObra + insumosConsumibles;

    return {
      costoMaterial: costoMaterial.toFixed(2),
      costoManoObra: costoManoObra.toFixed(2),
      insumos: insumosConsumibles.toFixed(2),
      totalUSD: totalUSD.toFixed(2)
    };
  }
};
