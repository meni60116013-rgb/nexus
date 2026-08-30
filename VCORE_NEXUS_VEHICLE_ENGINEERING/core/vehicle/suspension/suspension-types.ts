export type FrontSuspensionType =
  | "TELESCOPIC_FORK"
  | "USD_FORK"
  | "DOUBLE_WISHBONE";

export type RearSuspensionType =
  | "SWINGARM"
  | "MONOSHOCK"
  | "DUAL_SHOCK";

export interface SuspensionGeometry {
  frontTravelMm: number;
  rearTravelMm: number;
  frontSagMm: number;
  rearSagMm: number;
  frontRideHeightMm: number;
  rearRideHeightMm: number;
}

export interface SuspensionSystem {
  frontType: FrontSuspensionType;
  rearType: RearSuspensionType;
  geometry: SuspensionGeometry;
}
