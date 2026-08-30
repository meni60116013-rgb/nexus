import type {
  SuspensionGeometry
} from "../suspension-types";

export interface RearSuspensionSetup {
  type: "SWINGARM" | "MONOSHOCK" | "DUAL_SHOCK";
  swingarmLengthMm: number;
  shockStrokeMm: number;
  motionRatio: number;
  geometry: SuspensionGeometry;
}

export interface RearSuspensionValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateRearSuspension(
  setup: RearSuspensionSetup
): RearSuspensionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (setup.swingarmLengthMm <= 0) {
    errors.push(
      "swingarmLengthMm must be greater than zero"
    );
  }

  if (setup.shockStrokeMm <= 0) {
    errors.push(
      "shockStrokeMm must be greater than zero"
    );
  }

  if (setup.motionRatio <= 0) {
    errors.push(
      "motionRatio must be greater than zero"
    );
  }

  if (setup.geometry.rearTravelMm <= 0) {
    errors.push(
      "rearTravelMm must be greater than zero"
    );
  }

  if (setup.geometry.rearSagMm < 0) {
    errors.push(
      "rearSagMm cannot be negative"
    );
  }

  if (
    setup.geometry.rearSagMm >
    setup.geometry.rearTravelMm
  ) {
    errors.push(
      "rearSagMm cannot exceed rear travel"
    );
  }

  if (setup.motionRatio < 0.5) {
    warnings.push(
      "Very low rear suspension motion ratio"
    );
  }

  if (setup.motionRatio > 2.5) {
    warnings.push(
      "Very high rear suspension motion ratio"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
