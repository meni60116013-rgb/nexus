import type { TelemetryReading, Vehicle } from "./types";

/** Telemetría sintética derivada de los vehículos reales del taller.
 *  Determinista (sin Math.random) para que SSR e hidratación coincidan. */
export function buildTelemetry(vehicles: Vehicle[]): TelemetryReading[] {
  return vehicles.map((v, i) => {
    const h = hash(v.id);
    const electric = v.kind === "e-bike";
    return {
      id: `t-${v.id}`,
      vehicleId: v.id,
      at: new Date(2026, 7, 20 + (i % 5), 8 + (h % 10)).toISOString(),
      engineTempC: electric ? 38 + (h % 12) : 82 + (h % 40),
      oilPressureBar: electric ? 0 : Number((1.4 + (h % 22) / 10).toFixed(1)),
      vibrationG: Number((0.18 + (h % 110) / 100).toFixed(2)),
      rpm: electric ? 0 : 2400 + (h % 3200),
      batteryV: electric ? Number((44 + (h % 40) / 10).toFixed(1)) : Number((12 + (h % 24) / 10).toFixed(1)),
      dtc: h % 3 === 0 ? ["P0217"] : h % 5 === 0 ? ["P0521", "C1234"] : [],
      sos: h % 7 === 0,
    };
  });
}

function hash(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 100000;
  return n;
}

/** Catálogo base de refacciones — se inserta en la tabla real `piezas`
 *  del taller actual cuando se usa "cargar datos de ejemplo". */
export const DEMO_PIEZAS = [
  { sku: "OIL-10W40-1L", nombre: "Aceite sintético 10W40", categoria: "Lubricantes", stock: 24, stock_minimo: 10, costo: 180, precio: 320 },
  { sku: "FLT-AIR-FT250", nombre: "Filtro de aire FT250", categoria: "Filtros", stock: 4, stock_minimo: 6, costo: 140, precio: 290 },
  { sku: "KIT-ARR-520", nombre: "Kit de arrastre 520", categoria: "Transmisión", stock: 7, stock_minimo: 4, costo: 890, precio: 1490 },
  { sku: "SUS-MONO-200", nombre: "Monoamortiguador 200cc", categoria: "Suspensión", stock: 1, stock_minimo: 3, costo: 1750, precio: 3100 },
  { sku: "BRK-PAD-ORG", nombre: "Balatas orgánicas delanteras", categoria: "Frenos", stock: 18, stock_minimo: 8, costo: 210, precio: 420 },
  { sku: "BAT-48V-13A", nombre: "Pack batería 48V 13Ah", categoria: "Eléctrico", stock: 2, stock_minimo: 2, costo: 6200, precio: 9800 },
];

export const DEMO_CLIENTES = [
  { nombre: "Motos del Valle", telefono: "+52 55 1234 5678", email: "contacto@motosdelvalle.mx", tipo: "flota" },
  { nombre: "Laura Medina", telefono: "+52 55 9087 3311", email: "laura.medina@mail.com", tipo: "particular" },
  { nombre: "Rappi Fleet CDMX", telefono: "+52 55 4400 1122", email: "ops@fleetcdmx.mx", tipo: "flota" },
];

export const DEMO_VEHICULOS = [
  { clienteIdx: 0, marca: "Italika", modelo: "FT250", anio: 2023, placa: "MVA-3312", serie: "3LKFT250P23A0011", km_actual: 41250, tipo: "motocicleta" },
  { clienteIdx: 0, marca: "Bajaj", modelo: "Pulsar NS200", anio: 2022, placa: "MVA-7781", serie: "MD2A36AZ0NW1122", km_actual: 63870, tipo: "motocicleta" },
  { clienteIdx: 1, marca: "Yamaha", modelo: "MT-03", anio: 2024, placa: "LMD-1120", serie: "JYARH19E5PA0033", km_actual: 9120, tipo: "motocicleta" },
  { clienteIdx: 2, marca: "Vento", modelo: "Screamer 200", anio: 2021, placa: "FLT-0091", serie: "LVENT200S21C0455", km_actual: 88400, tipo: "scooter" },
];

export const DEMO_ORDENES = [
  { vehiculoIdx: 0, titulo: "Servicio mayor 40,000 km", descripcion: "Cambio de aceite, filtros, ajuste de válvulas y revisión de frenos.", estado: "en_proceso", tecnico: "M. Rivas", horas_mano_obra: 3.5, costo_piezas: 1850 },
  { vehiculoIdx: 2, titulo: "Diagnóstico de sobrecalentamiento", descripcion: "Temperatura alta en tráfico. Lecturas OBD-II adjuntas.", estado: "abierta", tecnico: "A. Fuentes", horas_mano_obra: 1.5, costo_piezas: 420 },
  { vehiculoIdx: 3, titulo: "Suspensión trasera + rodamientos", descripcion: "Amortiguador vencido, ruido en balineras traseras.", estado: "espera_piezas", tecnico: "J. Ontiveros", horas_mano_obra: 4, costo_piezas: 3100 },
  { vehiculoIdx: 1, titulo: "Reemplazo de kit de arrastre", descripcion: "Cadena y catarinas fuera de tolerancia.", estado: "cerrada", tecnico: "M. Rivas", horas_mano_obra: 2, costo_piezas: 1490 },
];
