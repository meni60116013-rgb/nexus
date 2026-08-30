export type VehicleCategory =
  | "MOTORCYCLE"
  | "SCOOTER"
  | "MOPED"
  | "MICROMOBILITY";

export interface VehicleIdentity {
  id: string;
  name: string;
  version: string;
  category: VehicleCategory;
  createdAt: number;
}

export interface VehicleDimensions {
  wheelbaseMm: number;
  overallLengthMm: number;
  overallWidthMm: number;
  overallHeightMm: number;
  seatHeightMm: number;
  groundClearanceMm: number;
}

export interface VehicleMass {
  dryMassKg: number;
  payloadKg: number;
  grossMassKg: number;
}

export interface VehiclePowertrain {
  propulsion: "ICE" | "ELECTRIC" | "HYBRID";
  displacementCc?: number;
  motorPowerKw?: number;
  batteryKwh?: number;
}

export interface Vehicle {
  identity: VehicleIdentity;
  dimensions: VehicleDimensions;
  mass: VehicleMass;
  powertrain: VehiclePowertrain;
  components: string[];
  materials: string[];
  status: "DRAFT" | "ENGINEERING" | "VALIDATION" | "RELEASE";
}
