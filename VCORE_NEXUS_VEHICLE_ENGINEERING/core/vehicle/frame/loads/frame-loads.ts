export interface FrameLoadCase {
  id: string;
  description: string;
  verticalLoadN: number;
  longitudinalLoadN: number;
  lateralLoadN: number;
  safetyFactor: number;
}

export interface FrameLoadResult {
  resultantN: number;
  designLoadN: number;
}

export function calculateResultantLoad(
  load: FrameLoadCase
): FrameLoadResult {
  const resultantN = Math.sqrt(
    load.verticalLoadN ** 2 +
    load.longitudinalLoadN ** 2 +
    load.lateralLoadN ** 2
  );

  return {
    resultantN,
    designLoadN: resultantN * load.safetyFactor
  };
}
