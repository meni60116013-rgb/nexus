'use strict';

const assert = require('assert');

const {
  calculatePowerW,
  calculateWheelTorque,
  calculateTractiveForce,
  calculatePowerToWeight,
  calculateAcceleration,
  calculateVehicleSpeed,
  calculateLongitudinalLoadTransfer,
  calculatePerformance
} = require('../powertrain_engine');

function close(actual, expected, tolerance = 0.000001) {
  return Math.abs(actual - expected) <= tolerance;
}

/* POWER */
const power = calculatePowerW(50, 6000);
assert(close(power, 31415.92653589793));

/* WHEEL TORQUE */
const wheelTorque = calculateWheelTorque({
  engineTorqueNm: 50,
  gearRatio: 2,
  finalDriveRatio: 3,
  drivetrainEfficiency: 0.9
});

assert(close(wheelTorque, 270));

/* TRACTIVE FORCE */
const tractiveForce = calculateTractiveForce(270, 0.3);
assert(close(tractiveForce, 900));

/* POWER / WEIGHT */
const powerToWeight = calculatePowerToWeight(40000, 200);
assert(close(powerToWeight, 200));

/* ACCELERATION */
const acceleration = calculateAcceleration({
  tractiveForceN: 900,
  massKg: 200,
  aerodynamicForceN: 50,
  rollingResistanceN: 20
});

assert(close(acceleration, 4.15));

/* VEHICLE SPEED */
const vehicleSpeedMS = calculateVehicleSpeed({
  wheelRadiusM: 0.3,
  rpm: 6000,
  gearRatio: 2,
  finalDriveRatio: 3
});

assert(close(
  vehicleSpeedMS,
  31.41592653589793
));

assert(close(
  vehicleSpeedMS * 3.6,
  113.09733552923255
));

/* LONGITUDINAL LOAD TRANSFER */
const loadTransfer = calculateLongitudinalLoadTransfer({
  massKg: 200,
  accelerationMS2: 4.15,
  cgHeightM: 0.55,
  wheelbaseM: 1.4
});

assert(close(
  loadTransfer,
  326.07142857142867
));

/* COMPLETE PERFORMANCE */
const result = calculatePerformance({
  engineTorqueNm: 50,
  rpm: 6000,
  gearRatio: 2,
  finalDriveRatio: 3,
  drivetrainEfficiency: 0.9,
  wheelRadiusM: 0.3,
  massKg: 200,
  aerodynamicForceN: 50,
  rollingResistanceN: 20,
  cgHeightM: 0.55,
  wheelbaseM: 1.4
});

assert(close(result.enginePowerW, power));
assert(close(result.enginePowerKW, power / 1000));
assert(close(result.wheelTorqueNm, 270));
assert(close(result.tractiveForceN, 900));
assert(close(result.accelerationMS2, 4.15));
assert(close(result.vehicleSpeedMS, 31.41592653589793));
assert(close(result.vehicleSpeedKPH, 113.09733552923255));
assert(close(result.powerToWeightWPerKg, 157.07963267948966));
assert(close(
  result.longitudinalLoadTransferN,
  326.07142857142867
));

console.log('POWERTRAIN / PERFORMANCE TESTS: PASS');
console.log('');
console.log('Engine power:', result.enginePowerKW, 'kW');
console.log('Wheel torque:', result.wheelTorqueNm, 'Nm');
console.log('Tractive force:', result.tractiveForceN, 'N');
console.log('Acceleration:', result.accelerationMS2, 'm/s²');
console.log('Vehicle speed:', result.vehicleSpeedKPH, 'km/h');
console.log(
  'Longitudinal load transfer:',
  result.longitudinalLoadTransferN,
  'N'
);
