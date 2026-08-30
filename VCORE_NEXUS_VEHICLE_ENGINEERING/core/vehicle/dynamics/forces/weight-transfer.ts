export interface WeightTransferInput {
  massKg: number;
  longitudinalAccelerationMps2: number;
  centerOfMassHeightMm: number;
  wheelbaseMm: number;
}

export interface WeightTransferResult {
  longitudinalWeightTransferN: number;
}

export function calculateLongitudinalWeightTransfer(
  input: WeightTransferInput
): WeightTransferResult {
  if (input.massKg <= 0)
    throw new Error("massKg must be greater than zero");

  if (input.wheelbaseMm <= 0)
    throw new Error(
      "wheelbaseMm must be greater than zero"
    );

  const gravity = 9.80665;

  const transferN =
    input.massKg *
    input.longitudinalAccelerationMps2 *
    (input.centerOfMassHeightMm / 1000) /
    (input.wheelbaseMm / 1000);

  return {
    longitudinalWeightTransferN:
      Math.abs(transferN)
  };
}
