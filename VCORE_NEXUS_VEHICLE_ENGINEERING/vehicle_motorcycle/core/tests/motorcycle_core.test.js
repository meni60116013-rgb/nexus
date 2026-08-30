'use strict';

const assert = require('assert');

const {
  calculateWheelCircumference,
  calculateWheelRPM,
  calculateTrail,
  createMotorcycleModel,
  validateMotorcycleModel,
  createMotorcycleSnapshot
} = require('../motorcycle_core');

const {
  adaptVehicleToMotorcycle
} = require('../../integration/motorcycle_vehicle_adapter');

const close = (a, b, tolerance = 1e-9) =>
  Math.abs(a - b) <= tolerance;

const circumference = calculateWheelCircumference(0.3);
assert(close(circumference, 1.8849555921538759));

const rpm = calculateWheelRPM(31.41592653589793, 0.3);
assert(close(rpm, 1000));

const trail = calculateTrail({
  wheelRadiusM: 0.3,
  steeringAngleDeg: 25,
  forkOffsetM: 0.035
});
assert(trail > 0);

const motorcycle = createMotorcycleModel({
  id: 'nexus-test-moto',
  category: 'sport',
  manufacturer: 'VCORE',
  model: 'NEXUS-R1',
  wheelbaseM: 1.4,
  frontWheelRadiusM: 0.3,
  rearWheelRadiusM: 0.3,
  steeringAngleDeg: 25,
  forkOffsetM: 0.035,
  massKg: 200,
  displacementCC: 600,
  enginePowerKW: 31.41592653589793,
  engineTorqueNm: 50
});

const validation = validateMotorcycleModel(motorcycle);
assert.strictEqual(validation.valid, true);
assert.strictEqual(validation.errors.length, 0);

const snapshot = createMotorcycleSnapshot(motorcycle);
assert.strictEqual(snapshot.schema, 'VCORE_MOTORCYCLE_SNAPSHOT');
assert.strictEqual(snapshot.vehicleType, 'motorcycle');
assert.strictEqual(snapshot.valid, true);
assert.strictEqual(snapshot.mass.massKg, 200);
assert.strictEqual(snapshot.dimensions.wheelbaseM, 1.4);

const adapted = adaptVehicleToMotorcycle({
  vehicleType: 'vehicle',
  id: 'vehicle-source-001',
  configuration: {
    wheelbaseM: 1.4,
    massKg: 200,
    frontWheelRadiusM: 0.3,
    rearWheelRadiusM: 0.3,
    steeringAngleDeg: 25,
    forkOffsetM: 0.035
  }
});

assert.strictEqual(adapted.targetType, 'motorcycle');
assert.strictEqual(adapted.validation.valid, true);
assert.strictEqual(adapted.snapshot.valid, true);

console.log('MOTORCYCLE CORE TEST: PASS');
console.log('Vehicle type:', snapshot.vehicleType);
console.log('Wheelbase:', snapshot.dimensions.wheelbaseM, 'm');
console.log('Mass:', snapshot.mass.massKg, 'kg');
console.log('Trail:', trail, 'm');
console.log('Adapter:', adapted.targetType);
