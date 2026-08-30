import {
  validateFrontSuspension,
  validateRearSuspension,
  calculateSpringForce
} from "../../../core/vehicle/suspension";

const geometry = {
  frontTravelMm: 120,
  rearTravelMm: 130,
  frontSagMm: 30,
  rearSagMm: 35,
  frontRideHeightMm: 180,
  rearRideHeightMm: 190
};

const front = validateFrontSuspension({
  forkType: "USD_FORK",
  forkDiameterMm: 43,
  geometry
});

const rear = validateRearSuspension({
  type: "MONOSHOCK",
  swingarmLengthMm: 550,
  shockStrokeMm: 50,
  motionRatio: 2.0,
  geometry
});

if (!front.valid) {
  throw new Error(front.errors.join("; "));
}

if (!rear.valid) {
  throw new Error(rear.errors.join("; "));
}

const spring = calculateSpringForce(
  {
    springRateNPerMm: 8,
    preloadMm: 10,
    installedLengthMm: 200,
    freeLengthMm: 220,
    maximumTravelMm: 60
  },
  20
);

if (spring.forceN <= 0) {
  throw new Error(
    "Invalid spring force"
  );
}

console.log(
  "SUSPENSION ENGINE TEST: PASS"
);
