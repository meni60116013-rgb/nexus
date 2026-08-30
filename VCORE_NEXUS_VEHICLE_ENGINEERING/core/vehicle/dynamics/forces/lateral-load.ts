export interface LateralLoadInput {
  massKg: number;
  lateralAccelerationMps2: number;
  trackWidthMm: number;
  centerOfMassHeightMm: number;
}

export interface LateralLoadResult {
  lateralForceN: number;
  rollMomentNm: number;
}

export function calculateLateralLoad(
  input: LateralLoadInput
): LateralLoadResult {
  if (input.massKg <= 0)
    throw new Error("massKg must be greater than zero");

  if (input.trackWidthMm <= 0)
    throw new Error(
      "trackWidthMm must be greater than zero"
    );

  const gravity = 9.80665;

  const lateralForceN =
    input.massKg *
    input.lateralAccelerationMps2;

  const rollMomentNm =
    lateralForceN *
    (input.centerOfMassHeightMm / 1000);

  return {
    lateralForceN,
    rollMomentNm
  };
}
