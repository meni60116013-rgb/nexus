'use strict';

const assert = require('assert');

const {
  createVehicle,
  updateVehicleState,
  markVehicleReady,
  getVehicleSummary
} = require('../vehicle_core');

const {
  adaptUniversalVehicle
} = require('../adapters/universal_vehicle_adapter');

const vehicle = createVehicle({
  id: 'nexus-vehicle-001',
  type: 'motorcycle',
  manufacturer: 'VCORE',
  model: 'Engineering Demonstrator',
  massKg: 200,
  wheelbaseM: 1.4,
  cgHeightM: 0.55,
  systems: {
    propulsion: { type: 'combustion' },
    suspension: { front: true, rear: true },
    brakes: { front: true, rear: true },
    wheels: { count: 2 }
  }
});

assert.strictEqual(vehicle.identity.id, 'nexus-vehicle-001');
assert.strictEqual(vehicle.identity.type, 'motorcycle');
assert.strictEqual(vehicle.configuration.massKg, 200);
assert.strictEqual(vehicle.configuration.wheelbaseM, 1.4);
assert.strictEqual(vehicle.state.lifecycle, 'configured');
assert.strictEqual(vehicle.state.ready, false);
assert.strictEqual(vehicle.state.revision, 1);

const validated = updateVehicleState(vehicle, {
  lifecycle: 'validated'
});

assert.strictEqual(validated.state.lifecycle, 'validated');
assert.strictEqual(validated.state.revision, 2);

const ready = markVehicleReady(validated);

assert.strictEqual(ready.state.lifecycle, 'ready');
assert.strictEqual(ready.state.ready, true);
assert.strictEqual(ready.state.revision, 3);

const summary = getVehicleSummary(ready);

assert.strictEqual(summary.id, 'nexus-vehicle-001');
assert.strictEqual(summary.massKg, 200);
assert.strictEqual(summary.wheelbaseM, 1.4);
assert.strictEqual(summary.lifecycle, 'ready');
assert.strictEqual(summary.ready, true);

const adapted = adaptUniversalVehicle({
  id: 'universal-001',
  type: 'motorcycle',
  manufacturer: 'VCORE',
  model: 'Universal',
  massKg: 250,
  wheelbaseM: 1.5,
  cgHeightM: 0.6
});

assert.strictEqual(adapted.identity.id, 'universal-001');
assert.strictEqual(adapted.configuration.massKg, 250);
assert.strictEqual(adapted.configuration.wheelbaseM, 1.5);
assert.strictEqual(adapted.state.lifecycle, 'configured');

console.log('VEHICLE CORE INTEGRATION TEST: PASS');
console.log('Identity: PASS');
console.log('Configuration: PASS');
console.log('Systems: PASS');
console.log('Lifecycle: PASS');
console.log('Universal adapter: PASS');
