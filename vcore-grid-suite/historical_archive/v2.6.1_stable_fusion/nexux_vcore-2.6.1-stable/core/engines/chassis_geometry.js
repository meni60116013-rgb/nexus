export default class ChassisGeometryEngine {
  /**
   * @param {number} rakeDeg - Ángulo de lanzamiento del cuello del chasis (grados)
   * @param {number} offsetMm - Offset / Desplazamiento de las tijas/mbolos (mm)
   * @param {number} radioRuedaMm - Radio efectivo de la rueda delantera (mm)
   */
  calcularAvance(rakeDeg, offsetMm, radioRuedaMm) {
    const rad = (rakeDeg * Math.PI) / 180;
    
    // Trail = (R * sin(Rake) - Offset) / cos(Rake)
    const trail = (radioRuedaMm * Math.sin(rad) - offsetMm) / Math.cos(rad);
    const mechanicalTrail = trail * Math.cos(rad);

    let comportamiento = 'Equilibrado / Estándar';
    if (trail < 80) comportamiento = 'Hiperreactivo (Inestable a alta velocidad)';
    if (trail > 120) comportamiento = 'Alta Estabilidad / Dirección pesada (Cruiser/Custom)';

    return {
      trailMm: trail.toFixed(2),
      mechanicalTrailMm: mechanicalTrail.toFixed(2),
      comportamiento,
      rakeDeg,
      offsetMm
    };
  }
}
