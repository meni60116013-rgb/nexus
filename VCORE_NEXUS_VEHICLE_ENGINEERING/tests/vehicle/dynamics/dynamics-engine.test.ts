import {
  analyzeVehicleDynamics
} from "../../../core/vehicle/dynamics";

const result =
  analyzeVehicleDynamics({
    massKg: 300,
    wheelbaseMm: 1400,
    centerOfMassHeightMm: 600,
    longitudinalAccelerationMps2: 6,
    lateralAccelerationMps2: 5,
    trackWidthMm: 0
  });

if (
  result.longitudinalWeightTransferN <= 0
) {
  throw new Error(
    "Invalid longitudinal weight transfer"
  );
}

if (result.lateralForceN <= 0) {
  throw new Error(
    "Invalid lateral force"
  );
}

if (result.rollMomentNm <= 0) {
  throw new Error(
    "Invalid roll moment"
  );
}

if (result.totalDynamicForceN <= 0) {
  throw new Error(
    "Invalid total dynamic force"
  );
}

console.log(
  "DYNAMICS ENGINE TEST: PASS"
);

console.log(
  `Weight transfer: ${result.longitudinalWeightTransferN.toFixed(1)} N`
);

console.log(
  `Lateral force: ${result.lateralForceN.toFixed(1)} N`
);

console.log(
  `Roll moment: ${result.rollMomentNm.toFixed(1)} Nm`
);
