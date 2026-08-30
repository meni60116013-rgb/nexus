import type {
  SuspensionGeometry
} from "../suspension-types";

export interface FrontSuspensionSetup {
  forkType: "TELESCOPIC_FORK" | "USD_FORK";
  forkDiameterMm: number;
  geometry: SuspensionGeometry;
}

export interface FrontSuspensionValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateFrontSuspension(
  setup: FrontSuspensionSetup
): FrontSuspensionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (setup.forkDiameterMm <= 0) {
    errors.push(
      "forkDiameterMm must be greater than zero"
    );
  }

  if (setup.geometry.frontTravelMm <= 0) {
    errors.push(
      "frontTravelMm must be greater than zero"
    );
  }

  if (setup.geometry.frontSagMm < 0) {
    errors.push(
      "frontSagMm cannot be negative"
    );
  }

  if (
    setup.geometry.frontSagMm >
    setup.geometry.frontTravelMm
  ) {
    errors.push(
      "frontSagMm cannot exceed front travel"
    );
  }

  if (
    setup.geometry.frontSagMm <
    setup.geometry.frontTravelMm * 0.15
  ) {
    warnings.push(
      "Front sag is unusually low"
    );
  }

  if (
    setup.geometry.frontSagMm >
    setup.geometry.frontTravelMm * 0.40
  ) {
    warnings.push(
      "Front sag is unusually high"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
