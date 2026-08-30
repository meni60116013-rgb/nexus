export interface WheelMotionInput {
  wheelTravelMm: number;
  motionRatio: number;
}

export interface WheelMotionResult {
  shockTravelMm: number;
  wheelTravelMm: number;
}

export function calculateWheelMotion(
  input: WheelMotionInput
): WheelMotionResult {
  if (input.wheelTravelMm < 0) {
    throw new Error(
      "wheelTravelMm cannot be negative"
    );
  }

  if (input.motionRatio <= 0) {
    throw new Error(
      "motionRatio must be greater than zero"
    );
  }

  return {
    wheelTravelMm: input.wheelTravelMm,
    shockTravelMm:
      input.wheelTravelMm /
      input.motionRatio
  };
}
