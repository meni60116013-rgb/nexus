export const MATERIALS = {
  chromoly: {
    name: '4130 Chromoly (Gris Acero CAD)',
    densityKgM3: 7850,
    yieldMPa: 460,
    color: 0x8b949e // Gris acero neutro profesional
  },
  aluminum: {
    name: 'Aluminio 6061-T6 (Blanco Técnico)',
    densityKgM3: 2700,
    yieldMPa: 276,
    color: 0xd0d7de // Blanco/Gris claro técnico
  },
  titanium: {
    name: 'Titanio Grado 5 (Azul Industrial Muted)',
    densityKgM3: 4430,
    yieldMPa: 880,
    color: 0x57606a // Azul/Gris oscuro técnico
  }
};

export function calculateStructuralMetrics(params) {
  const mat = MATERIALS[params.materialKey] || MATERIALS.chromoly;

  const tubeArea = Math.PI * Math.pow(params.tubeRadius, 2) - Math.PI * Math.pow(params.tubeRadius - 0.002, 2);
  const totalLength = params.chassisLength * 8 + params.headstockHeight * 4 + params.pivotWidth * 4;
  const volumeM3 = tubeArea * totalLength;

  const weightKg = (volumeM3 * mat.densityKgM3).toFixed(2);
  const maxTorqueNm = ((mat.yieldMPa * 1000) * tubeArea * params.pivotWidth / 2).toFixed(1);
  const safetyFactor = (mat.yieldMPa / 150).toFixed(2);

  return {
    materialName: mat.name,
    weightKg,
    maxTorqueNm,
    safetyFactor
  };
}
