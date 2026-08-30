'use strict';

const assert = require('assert');

const {
  createUniversalVehicle,
  validateUniversalVehicle,
  createVehicleSnapshot
} = require('../universal_vehicle_core');

const {
  adaptEngineeringVehicle
} = require('../adapters/engineering_adapter');

const vehicle = createUniversalVehicle({
  id: 'nexus-001',
  type: 'motorcycle',
  manufacturer: 'VCORE',
  model: 'Demonstrator',
  massKg: 200,
  wheelbaseM: 1.4,
  cgHeightM: 0.55
});

const validation = validateUniversalVehicle(vehicle);

assert.strictEqual(validation.valid, true);
assert.strictEqual(validation.errors.length, 0);
assert.strictEqual(vehicle.massKg, 200);
assert.strictEqual(vehicle.wheelbaseM, 1.4);

const snapshot = createVehicleSnapshot(vehicle);

assert.strictEqual(
  snapshot.schema,
  'VCORE_UNIVERSAL_VEHICLE'
);

assert.strictEqual(snapshot.version, '1.0.0');
assert.strictEqual(snapshot.valid, true);

const adapted = adaptEngineeringVehicle({
  vehicleId: 'engineering-001',
  vehicleType: 'motorcycle',
  mass: 200,
  wheelbase: 1.4,
  cgHeightM: 0.55
});

assert.strictEqual(adapted.valid, true);
assert.strictEqual(
  adapted.vehicle.massKg,
  200
);

assert.strictEqual(
  adapted.vehicle.wheelbaseM,
  1.4
);

const invalid = validateUniversalVehicle({
  id: 'invalid',
  type: 'motorcycle',
  massKg: 0,
  wheelbaseM: 0
});

assert.strictEqual(invalid.valid, false);
assert(invalid.errors.length >= 2);

console.log('UNIVERSAL VEHICLE CORE TEST: PASS');
console.log('Schema:', snapshot.schema);
console.log('Vehicle:', vehicle.id);
console.log('Type:', vehicle.type);
console.log('Mass:', vehicle.massKg, 'kg');
console.log('Wheelbase:', vehicle.wheelbaseM, 'm');
console.log('Engineering adapter: PASS');
