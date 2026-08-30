import {
  analyzeFrame
} from "../../../core/vehicle/frame";

const geometry = {
  wheelbaseMm: 1400,
  rakeDeg: 25,
  trailMm: 100,
  headTubeAngleDeg: 65,
  headTubeLengthMm: 180,
  swingarmLengthMm: 550,
  frontTrackMm: 0,
  rearTrackMm: 0
};

const nodes = [
  {
    id: "STEERING",
    xMm: 0,
    yMm: 0,
    zMm: 850,
    role: "STEERING_HEAD" as const
  },
  {
    id: "PIVOT",
    xMm: 700,
    yMm: 0,
    zMm: 500,
    role: "SWINGARM_PIVOT" as const
  },
  {
    id: "ENGINE",
    xMm: 650,
    yMm: 0,
    zMm: 300,
    role: "ENGINE_MOUNT" as const
  },
  {
    id: "SEAT",
    xMm: 850,
    yMm: 0,
    zMm: 700,
    role: "SEAT_MOUNT" as const
  }
];

const members = [
  {
    id: "TOP_TUBE",
    from: "STEERING",
    to: "SEAT",
    outerDiameterMm: 32,
    wallThicknessMm: 2,
    materialId: "CROMOLY_4130"
  },
  {
    id: "DOWN_TUBE",
    from: "STEERING",
    to: "ENGINE",
    outerDiameterMm: 38,
    wallThicknessMm: 2.5,
    materialId: "CROMOLY_4130"
  },
  {
    id: "MAIN_RAIL",
    from: "ENGINE",
    to: "PIVOT",
    outerDiameterMm: 32,
    wallThicknessMm: 2,
    materialId: "CROMOLY_4130"
  },
  {
    id: "SEAT_RAIL",
    from: "PIVOT",
    to: "SEAT",
    outerDiameterMm: 28,
    wallThicknessMm: 2,
    materialId: "CROMOLY_4130"
  }
];

const result =
  analyzeFrame(
    geometry,
    nodes,
    members
  );

if (!result.valid) {
  throw new Error(
    result.geometry.errors.join("; ")
  );
}

if (result.nodeCount !== 4) {
  throw new Error("Unexpected frame node count");
}

if (result.memberCount !== 4) {
  throw new Error("Unexpected frame member count");
}

if (result.totalTubeLengthMm <= 0) {
  throw new Error("Invalid total tube length");
}

if (result.estimatedStructuralMassKg <= 0) {
  throw new Error("Invalid estimated frame mass");
}

if (result.maximumDesignLoadN <= 0) {
  throw new Error("Invalid design load");
}

console.log("FRAME ENGINE TEST: PASS");
console.log(
  `Tube length: ${result.totalTubeLengthMm.toFixed(1)} mm`
);
console.log(
  `Estimated frame mass: ${result.estimatedStructuralMassKg.toFixed(2)} kg`
);
console.log(
  `Maximum design load: ${result.maximumDesignLoadN.toFixed(1)} N`
);
