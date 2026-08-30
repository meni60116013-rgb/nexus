export interface FrameGeometry {
  wheelbaseMm: number;
  rakeDeg: number;
  trailMm: number;
  headTubeAngleDeg: number;
  headTubeLengthMm: number;
  swingarmLengthMm: number;
  frontTrackMm: number;
  rearTrackMm: number;
}

export interface FrameGeometryValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateFrameGeometry(
  geometry: FrameGeometry
): FrameGeometryValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (geometry.wheelbaseMm <= 0)
    errors.push("wheelbaseMm must be greater than zero");

  if (geometry.rakeDeg <= 0 || geometry.rakeDeg >= 90)
    errors.push("rakeDeg must be between 0 and 90 degrees");

  if (geometry.trailMm <= 0)
    errors.push("trailMm must be greater than zero");

  if (geometry.headTubeAngleDeg <= 0 || geometry.headTubeAngleDeg >= 90)
    errors.push("headTubeAngleDeg must be between 0 and 90 degrees");

  if (geometry.headTubeLengthMm <= 0)
    errors.push("headTubeLengthMm must be greater than zero");

  if (geometry.swingarmLengthMm <= 0)
    errors.push("swingarmLengthMm must be greater than zero");

  if (geometry.frontTrackMm < 0)
    errors.push("frontTrackMm cannot be negative");

  if (geometry.rearTrackMm < 0)
    errors.push("rearTrackMm cannot be negative");

  if (geometry.wheelbaseMm < 1000)
    warnings.push("Very short motorcycle wheelbase");

  if (geometry.wheelbaseMm > 1800)
    warnings.push("Very long motorcycle wheelbase");

  if (geometry.rakeDeg < 20 || geometry.rakeDeg > 40)
    warnings.push("Rake outside common motorcycle design range");

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
