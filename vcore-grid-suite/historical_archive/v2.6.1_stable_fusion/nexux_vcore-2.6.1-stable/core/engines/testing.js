import { calculateStructuralMetrics, MATERIALS } from './analysis.js';
import { analyzeCircuitProtection } from './diagnostics.js';

export function runVirtualAudit(chassisParams, assemblyParams, electricalParams) {
  const metrics = calculateStructuralMetrics(chassisParams);
  const diag = analyzeCircuitProtection(electricalParams.vIn, electricalParams.iSense, electricalParams.rFeedback);

  const logs = [];
  let riskLevel = 'PASS'; // PASS, WARNING, DANGER

  // 1. Prueba de Torsión y Rigidez del Chasis
  if (metrics.safetyFactor < 1.5) {
    logs.push({
      type: 'DANGER',
      category: 'Estructural',
      msg: `Factor de seguridad crítico (${metrics.safetyFactor}). Riesgo de deformación plástica en pipa de dirección bajo torsión extrema.`
    });
    riskLevel = 'DANGER';
  } else if (metrics.safetyFactor < 2.2) {
    logs.push({
      type: 'WARNING',
      category: 'Estructural',
      msg: `Factor de seguridad ajustado (${metrics.safetyFactor}). Se recomienda aumentar el grosor del tubo principal si se usará en competición off-road.`
    });
    if (riskLevel !== 'DANGER') riskLevel = 'WARNING';
  } else {
    logs.push({
      type: 'PASS',
      category: 'Estructural',
      msg: `Rigidez torsional validada. Factor de seguridad óptimo (${metrics.safetyFactor}).`
    });
  }

  // 2. Prueba de Relación Peso / Potencia del Ensamblaje
  if (metrics.weightKg > 25 && chassisParams.chassisLength > 1.8) {
    logs.push({
      type: 'WARNING',
      category: 'Ensamblaje / Inercia',
      msg: `El peso estructural estimado (${metrics.weightKg} kg) combinado con la longitud del chasis puede generar sobreviraje en curvas cerradas.`
    });
    if (riskLevel !== 'DANGER') riskLevel = 'WARNING';
  } else {
    logs.push({
      type: 'PASS',
      category: 'Ensamblaje / Inercia',
      msg: `Distribución de masas y centro de gravedad dentro de parámetros de estabilidad estándar.`
    });
  }

  // 3. Prueba de Protección Eléctrica y Lazo de Control
  if (diag.status === 'SHUTDOWN' || diag.status === 'OVERLOAD') {
    logs.push({
      type: 'DANGER',
      category: 'Sistema Eléctrico',
      msg: `Fallo en la protección del circuito (${diag.status}). Riesgo de daño en la ECU y sobrecalentamiento del cableado principal.`
    });
    riskLevel = 'DANGER';
  } else {
    logs.push({
      type: 'PASS',
      category: 'Sistema Eléctrico',
      msg: `Lazo de realimentación y referencia de voltaje estables (${diag.vRef}). Sin riesgo de picos de corriente.`
    });
  }

  return {
    timestamp: new Date().toISOString(),
    overallStatus: riskLevel,
    metrics: metrics,
    auditLogs: logs
  };
}
