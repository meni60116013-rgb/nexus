'use strict';

const assert = require('assert');

const {
  createMotorcycleSystems,
  validateMotorcycleSystems,
  getSystemRegistry,
  getMotorcycleSystemsSnapshot
} = require('../motorcycle_systems_engine');

const {
  integrateMotorcycleSystems
} = require('../adapter/motorcycle_systems_adapter');

const systems = createMotorcycleSystems({
  suspension: {
    id: 'suspension-front-rear',
    version: '1.0.0'
  },

  brakes: {
    id: 'brakes-front-rear',
    version: '1.0.0'
  },

  wheels: {
    id: 'wheels-front-rear',
    version: '1.0.0'
  },

  powertrain: {
    id: 'powertrain-performance',
    version: '1.0.0'
  }
});

assert(systems.suspension);
assert(systems.brakes);
assert(systems.wheels);
assert(systems.powertrain);

const validation = validateMotorcycleSystems(systems);

assert.strictEqual(validation.valid, true);
assert.strictEqual(validation.errors.length, 0);
assert.strictEqual(validation.systemCount, 4);

const registry = getSystemRegistry(systems);

assert.strictEqual(registry.length, 4);

const keys = registry.map(item => item.key);

assert(keys.includes('suspension'));
assert(keys.includes('brakes'));
assert(keys.includes('wheels'));
assert(keys.includes('powertrain'));

const snapshot = getMotorcycleSystemsSnapshot(systems);

assert.strictEqual(
  snapshot.schema,
  'VCORE_MOTORCYCLE_SYSTEMS_SNAPSHOT'
);

assert.strictEqual(snapshot.valid, true);
assert.strictEqual(snapshot.systems.length, 4);

const integration = integrateMotorcycleSystems({
  suspension: {},
  brakes: {},
  wheels: {},
  powertrain: {}
});

assert.strictEqual(
  integration.integrationStatus,
  'PASS'
);

assert.strictEqual(
  integration.validation.valid,
  true
);

assert.strictEqual(
  integration.snapshot.systems.length,
  4
);

console.log('MOTORCYCLE SYSTEMS INTEGRATION TEST: PASS');
console.log('');
console.log('Systems:', registry.length);
console.log('Suspension:', systems.suspension.status);
console.log('Brakes:', systems.brakes.status);
console.log('Wheels:', systems.wheels.status);
console.log('Powertrain:', systems.powertrain.status);
console.log('Integration:', integration.integrationStatus);
