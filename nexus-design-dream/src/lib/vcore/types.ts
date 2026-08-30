export type OrderStatus = "abierta" | "en_proceso" | "espera_piezas" | "cerrada";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: "particular" | "flota";
  createdAt: string;
}

export interface Vehicle {
  id: string;
  clientId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  km: number;
  kind: "motocicleta" | "scooter" | "e-bike";
}

export interface WorkOrder {
  id: string;
  folio: string;
  clientId: string;
  vehicleId: string;
  title: string;
  description: string;
  status: OrderStatus;
  technician: string;
  laborHours: number;
  partsCost: number;
  laborRate: number;
  createdAt: string;
  synced: boolean;
}

export interface TelemetryReading {
  id: string;
  vehicleId: string;
  at: string;
  engineTempC: number;
  oilPressureBar: number;
  vibrationG: number;
  rpm: number;
  batteryV: number;
  dtc: string[];
  sos: boolean;
}

export interface Part {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  cost: number;
  price: number;
}

/** Línea de BOM: una pieza usada dentro de una orden de trabajo específica. */
export interface BomLine {
  id: string;
  ordenId: string;
  piezaId: string;
  piezaNombre: string;
  piezaSku: string;
  cantidad: number;
  precioUnitario: number;
}

export interface VcoreState {
  clients: Client[];
  vehicles: Vehicle[];
  orders: WorkOrder[];
  telemetry: TelemetryReading[];
  parts: Part[];
}
