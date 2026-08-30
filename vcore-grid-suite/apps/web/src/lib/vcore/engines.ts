import type { TelemetryReading, Vehicle, WorkOrder } from "./types";
import { orderTotal } from "./store";

export type Severity = "ok" | "aviso" | "critico";

export interface DiagnosticFinding {
  code: string;
  title: string;
  severity: Severity;
  detail: string;
  action: string;
}

/** DiagnosticsCore — interpreta telemetría cruda en hallazgos accionables. */
export function runDiagnostics(r: TelemetryReading): DiagnosticFinding[] {
  const out: DiagnosticFinding[] = [];

  if (r.engineTempC >= 112) {
    out.push({
      code: "TEMP-HIGH",
      title: "Sobrecalentamiento del motor",
      severity: "critico",
      detail: `Temperatura ${r.engineTempC} °C por encima del umbral operativo (110 °C).`,
      action: "Revisar refrigerante, termostato y flujo del radiador antes de liberar la unidad.",
    });
  } else if (r.engineTempC >= 100) {
    out.push({
      code: "TEMP-WARN",
      title: "Temperatura elevada",
      severity: "aviso",
      detail: `Temperatura ${r.engineTempC} °C dentro de zona de vigilancia.`,
      action: "Monitorear en ruta y verificar nivel de refrigerante.",
    });
  }

  if (r.oilPressureBar > 0 && r.oilPressureBar < 1.8) {
    out.push({
      code: "OIL-LOW",
      title: "Presión de aceite baja",
      severity: "critico",
      detail: `Presión ${r.oilPressureBar.toFixed(1)} bar (mínimo seguro 1.8 bar).`,
      action: "Detener operación. Verificar bomba, nivel y sensor de presión.",
    });
  }

  if (r.vibrationG >= 1.0) {
    out.push({
      code: "VIB-HIGH",
      title: "Vibración fuera de rango",
      severity: "critico",
      detail: `Vibración ${r.vibrationG.toFixed(2)} G — patrón compatible con desbalance o rodamiento dañado.`,
      action: "Inspeccionar balineras, rines y anclajes de motor.",
    });
  } else if (r.vibrationG >= 0.6) {
    out.push({
      code: "VIB-WARN",
      title: "Vibración en aumento",
      severity: "aviso",
      detail: `Vibración ${r.vibrationG.toFixed(2)} G sobre la línea base del modelo.`,
      action: "Balancear rueda y revisar tensión de cadena.",
    });
  }

  if (r.batteryV > 0 && r.batteryV < 12.4 && r.batteryV < 20) {
    out.push({
      code: "BAT-LOW",
      title: "Sistema eléctrico débil",
      severity: "aviso",
      detail: `Voltaje ${r.batteryV.toFixed(1)} V bajo carga.`,
      action: "Probar regulador/rectificador y estado de la batería.",
    });
  }

  for (const dtc of r.dtc) {
    out.push({
      code: dtc,
      title: `Código DTC ${dtc}`,
      severity: dtc.startsWith("P0") ? "aviso" : "critico",
      detail: DTC_MAP[dtc] ?? "Código detectado por el módulo OBD-II del vehículo.",
      action: "Confirmar con lectura en vivo y borrar tras la reparación.",
    });
  }

  if (r.sos) {
    out.push({
      code: "SOS",
      title: "Alerta SOS activa",
      severity: "critico",
      detail: "El vehículo emitió una señal de emergencia desde el módulo de telemetría.",
      action: "Contactar al operador y despachar asistencia.",
    });
  }

  if (out.length === 0) {
    out.push({
      code: "OK",
      title: "Sin anomalías detectadas",
      severity: "ok",
      detail: "Todas las variables se encuentran dentro de rango nominal.",
      action: "Continuar con el plan de mantenimiento programado.",
    });
  }

  return out;
}

const DTC_MAP: Record<string, string> = {
  P0217: "Sobrecalentamiento del motor detectado por la ECU.",
  P0128: "Termostato por debajo de la temperatura de regulación.",
  P0521: "Rango o desempeño anómalo del sensor de presión de aceite.",
  C1234: "Falla en sensor de velocidad de rueda (chasis).",
  B0044: "Anomalía en el módulo de gestión de batería (BMS).",
};

export function healthScore(r: TelemetryReading): number {
  let score = 100;
  score -= Math.max(0, r.engineTempC - 95) * 1.6;
  if (r.oilPressureBar > 0) score -= Math.max(0, 3 - r.oilPressureBar) * 9;
  score -= Math.max(0, r.vibrationG - 0.35) * 40;
  score -= r.dtc.length * 7;
  if (r.sos) score -= 25;
  return Math.round(Math.max(0, Math.min(100, score)));
}

/** PredictiveMaintenanceCore — estima km restantes hasta la próxima intervención. */
export function predictService(vehicle: Vehicle, reading?: TelemetryReading) {
  const interval = vehicle.kind === "e-bike" ? 3000 : 5000;
  const sinceService = vehicle.km % interval;
  let remaining = interval - sinceService;
  const stress = reading ? (100 - healthScore(reading)) / 100 : 0.1;
  remaining = Math.round(remaining * (1 - stress * 0.6));
  return {
    interval,
    remaining: Math.max(0, remaining),
    urgency: remaining < 400 ? "critico" : remaining < 1200 ? "aviso" : "ok",
  } as const;
}

/** SuspensionCore — precarga y constante de resorte sugeridas. */
export function suspensionSetup(riderKg: number, bikeKg: number, travelMm: number, usage: number) {
  const totalKg = riderKg + bikeKg;
  const sagMm = travelMm * (0.3 + usage * 0.05);
  const springRate = (totalKg * 9.81 * 0.62) / (sagMm / 1000) / 1000; // N/mm
  const preloadMm = Math.max(0, (totalKg - 150) * 0.12 + usage * 1.5);
  const damping = Math.round(6 + usage * 1.4 + (totalKg - 150) / 30);
  return {
    sagMm: Math.round(sagMm),
    springRate: Number(springRate.toFixed(1)),
    preloadMm: Number(preloadMm.toFixed(1)),
    dampingClicks: Math.max(2, Math.min(20, damping)),
  };
}

/** AerodynamicsCore — arrastre y potencia requerida a velocidad de crucero. */
export function aeroAnalysis(cd: number, areaM2: number, speedKmh: number, massKg: number) {
  const rho = 1.225;
  const v = speedKmh / 3.6;
  const drag = 0.5 * rho * cd * areaM2 * v * v;
  const rolling = 0.015 * massKg * 9.81;
  const powerW = (drag + rolling) * v;
  return {
    dragN: Number(drag.toFixed(1)),
    rollingN: Number(rolling.toFixed(1)),
    powerHp: Number((powerW / 745.7).toFixed(1)),
    curve: Array.from({ length: 9 }, (_, i) => {
      const kmh = 40 + i * 15;
      const vv = kmh / 3.6;
      const d = 0.5 * rho * cd * areaM2 * vv * vv;
      return { kmh, drag: Number(d.toFixed(0)), hp: Number(((d + rolling) * vv / 745.7).toFixed(1)) };
    }),
  };
}

/** AnalyticsCore — indicadores operativos del taller. */
export function workshopKpis(orders: WorkOrder[]) {
  const closed = orders.filter((o) => o.status === "cerrada");
  const revenue = closed.reduce((s, o) => s + orderTotal(o), 0);
  const pipeline = orders.filter((o) => o.status !== "cerrada").reduce((s, o) => s + orderTotal(o), 0);
  const hours = orders.reduce((s, o) => s + o.laborHours, 0);
  return {
    total: orders.length,
    open: orders.length - closed.length,
    closed: closed.length,
    revenue,
    pipeline,
    hours: Number(hours.toFixed(1)),
    ticket: closed.length ? Math.round(revenue / closed.length) : 0,
    pendingSync: orders.filter((o) => !o.synced).length,
  };
}
