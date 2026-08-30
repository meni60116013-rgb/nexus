export interface FrameGeometry {
  wheelbaseMm: number;
  rakeDeg: number;
  trailMm: number;
  headTubeLengthMm: number;
  swingarmLengthMm: number;
}

export function validateFrameGeometry(
  geometry: FrameGeometry
): string[] {
  const errors: string[] = [];

  if (geometry.wheelbaseMm <= 0)
    errors.push("wheelbaseMm must be greater than zero");

  if (geometry.rakeDeg <= 0 || geometry.rakeDeg >= 90)
    errors.push("rakeDeg must be between 0 and 90 degrees");

  if (geometry.trailMm <= 0)
    errors.push("trailMm must be greater than zero");

  if (geometry.headTubeLengthMm <= 0)
    errors.push("headTubeLengthMm must be greater than zero");

  if (geometry.swingarmLengthMm <= 0)
    errors.push("swingarmLengthMm must be greater than zero");

  return errors;
}
