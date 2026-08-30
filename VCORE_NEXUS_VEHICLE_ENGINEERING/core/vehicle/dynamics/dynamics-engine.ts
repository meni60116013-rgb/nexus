import {
  calculateLongitudinalWeightTransfer
} from "./forces/weight-transfer";

import {
  calculateLateralLoad
} from "./forces/lateral-load";

export interface VehicleDynamicsInput {
  massKg: number;
  wheelbaseMm: number;
  centerOfMassHeightMm: number;
  longitudinalAccelerationMps2: number;
  lateralAccelerationMps2: number;
  trackWidthMm: number;
}

export interface VehicleDynamicsResult {
  longitudinalWeightTransferN: number;
  lateralForceN: number;
  rollMomentNm: number;
  totalDynamicForceN: number;
}

export function analyzeVehicleDynamics(
  input: VehicleDynamicsInput
): VehicleDynamicsResult {
  const longitudinal =
    calculateLongitudinalWeightTransfer(input);

  const lateral =
    calculateLateralLoad(input);

  const totalDynamicForceN =
    Math.sqrt(
      longitudinal.longitudinalWeightTransferN ** 2 +
      lateral.lateralForceN ** 2
    );

  return {
    longitudinalWeightTransferN:
      longitudinal.longitudinalWeightTransferN,
    lateralForceN:
      lateral.lateralForceN,
    rollMomentNm:
      lateral.rollMomentNm,
    totalDynamicForceN
  };
}
