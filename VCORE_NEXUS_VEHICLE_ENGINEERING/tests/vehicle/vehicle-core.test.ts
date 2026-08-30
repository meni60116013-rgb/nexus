import {
  validateVehicle,
  validateFrameGeometry,
  MATERIALS,
  VEHICLE_COMPONENTS
} from "../../core/vehicle";

const vehicle = {
  identity: {
    id: "VCORE-MOTO-001",
    name: "VCORE Prototype",
    version: "0.1.0",
    category: "MOTORCYCLE" as const,
    createdAt: Date.now()
  },
  dimensions: {
    wheelbaseMm: 1400,
    overallLengthMm: 2100,
    overallWidthMm: 800,
    overallHeightMm: 1100,
    seatHeightMm: 800,
    groundClearanceMm: 160
  },
  mass: {
    dryMassKg: 150,
    payloadKg: 150,
    grossMassKg: 300
  },
  powertrain: {
    propulsion: "ICE" as const,
    displacementCc: 250
  },
  components: [...VEHICLE_COMPONENTS],
  materials: ["CROMOLY_4130"],
  status: "DRAFT" as const
};

const vehicleErrors = validateVehicle(vehicle);

if (vehicleErrors.length !== 0) {
  throw new Error(vehicleErrors.join("; "));
}

const frameErrors = validateFrameGeometry({
  wheelbaseMm: 1400,
  rakeDeg: 25,
  trailMm: 100,
  headTubeLengthMm: 180,
  swingarmLengthMm: 550
});

if (frameErrors.length !== 0) {
  throw new Error(frameErrors.join("; "));
}

if (MATERIALS.length < 3) {
  throw new Error("Engineering material database incomplete");
}

console.log("VEHICLE CORE TEST: PASS");
