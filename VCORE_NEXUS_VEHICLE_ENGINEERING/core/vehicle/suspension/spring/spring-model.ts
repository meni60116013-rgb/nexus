export interface SpringParameters {
  springRateNPerMm: number;
  preloadMm: number;
  installedLengthMm: number;
  freeLengthMm: number;
  maximumTravelMm: number;
}

export interface SpringResult {
  forceN: number;
  availableTravelMm: number;
  compressedLengthMm: number;
}

export function calculateSpringForce(
  spring: SpringParameters,
  compressionMm: number
): SpringResult {
  if (spring.springRateNPerMm <= 0) {
    throw new Error("springRateNPerMm must be greater than zero");
  }

  if (compressionMm < 0) {
    throw new Error("compressionMm cannot be negative");
  }

  const totalCompressionMm =
    spring.preloadMm + compressionMm;

  const forceN =
    spring.springRateNPerMm *
    totalCompressionMm;

  const compressedLengthMm =
    spring.freeLengthMm -
    totalCompressionMm;

  const availableTravelMm =
    Math.max(
      0,
      spring.maximumTravelMm - compressionMm
    );

  return {
    forceN,
    availableTravelMm,
    compressedLengthMm
  };
}
