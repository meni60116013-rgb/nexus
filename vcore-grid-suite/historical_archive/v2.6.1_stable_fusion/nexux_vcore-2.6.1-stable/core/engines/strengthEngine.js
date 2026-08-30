// V-CORE SENTINEL // Motor de Resistencia de Materiales y Esfuerzos en Chasis
export const strengthEngine = {
  // Propiedades típicas de materiales de chasis (Límite Elástico en MPa)
  materiales: {
    "acero_1020": { nombre: "Acero 1020 / Estructural", limiteElastico: 290 },
    "cromoly_4130": { nombre: "4130 Cromoly", limiteElastico: 460 },
    "dom_1026": { nombre: "Tubo D.O.M. 1026", limiteElastico: 370 }
  },

  calcularEsfuerzoTubo: function(fuerzaN, longitudMm, diametroExtMm, espesorParedMm, materialClave = "cromoly_4130") {
    const mat = this.materiales[materialClave] || this.materiales["cromoly_4130"];
    const rExt = diametroExtMm / 2;
    const rInt = rExt - espesorParedMm;
    
    // Área de la sección transversal: A = pi * (R^2 - r^2)
    const areaMm2 = Math.PI * (Math.pow(rExt, 2) - Math.pow(rInt, 2));
    
    // Momento de Inercia: I = (pi / 4) * (R^4 - r^4)
    const inerciaMm4 = (Math.PI / 4) * (Math.pow(rExt, 4) - Math.pow(rInt, 4));
    
    // Momento Flector Máximo (Viga voladizo / Carga central simplificada): M = F * L
    const momentoFlectorNmm = fuerzaN * longitudMm;
    
    // Esfuerzo por flexión: sigma = (M * rExt) / I
    const esfuerzoFlexionMPa = (momentoFlectorNmm * rExt) / inerciaMm4;
    
    // Factor de Seguridad: FdS = LimiteElastico / EsfuerzoFlexion
    const factorSeguridad = mat.limiteElastico / (esfuerzoFlexionMPa || 1);
    
    return {
      material: mat.nombre,
      areaMm2: areaMm2.toFixed(2),
      esfuerzoMPa: esfuerzoFlexionMPa.toFixed(2),
      factorSeguridad: factorSeguridad.toFixed(2),
      estadoEstructural: factorSeguridad >= 2.0 ? "ÓPTIMO / SEGURO" : (factorSeguridad >= 1.2 ? "PRECAUCIÓN" : "CRÍTICO / RIESGO")
    };
  }
};
