import type { FrameLoadCase } from "./frame-loads";

export const STANDARD_FRAME_LOAD_CASES: FrameLoadCase[] = [
  {
    id: "STATIC",
    description: "Static vehicle loading",
    verticalLoadN: 3000,
    longitudinalLoadN: 0,
    lateralLoadN: 0,
    safetyFactor: 1.5
  },
  {
    id: "BRAKING",
    description: "Longitudinal braking load",
    verticalLoadN: 3000,
    longitudinalLoadN: 2500,
    lateralLoadN: 0,
    safetyFactor: 1.5
  },
  {
    id: "CORNERING",
    description: "Lateral cornering load",
    verticalLoadN: 3000,
    longitudinalLoadN: 500,
    lateralLoadN: 1800,
    safetyFactor: 1.5
  }
];
