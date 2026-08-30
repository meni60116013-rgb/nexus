'use strict';

const assert = require('assert');

const {
  buildMotorcycleConfiguration
} = require('../motorcycle_configuration');

const motorcycle = buildMotorcycleConfiguration({
  id: 'nexus-moto-001',
  name: 'Nexus Engineering Motorcycle',
  version: '1.0.0',

  wheelbaseM: 1.4,
  frontWheelRadiusM: 0.30,
  rearWheelRadiusM: 0.31,

  steeringHeadAngleDeg: 25,
  trailM: 0.10,

  frontSuspension: {
    type: 'telescopic',
    travelM: 0.12
  },

  rearSuspension: {
    type: 'monoshock',
    travelM: 0.10
  },

  frontBrake: {
    type: 'disc'
  },

  rearBrake: {
    type: 'disc'
  },

  powertrain: {
    engineTorqueNm: 50,
    rpm: 6000
  }
});

/* IDENTITY */
assert.strictEqual(
  motorcycle.id,
  'nexus-moto-001'
);

assert.strictEqual(
  motorcycle.type,
  'motorcycle'
);

assert.strictEqual(
  motorcycle.name,
  'Nexus Engineering Motorcycle'
);

/* CHASSIS */
assert.strictEqual(
  motorcycle.chassis.wheelbaseM,
  1.4
);

assert.strictEqual(
  motorcycle.chassis.steeringHeadAngleDeg,
  25
);

assert.strictEqual(
  motorcycle.chassis.trailM,
  0.10
);

/* WHEELS */
assert.strictEqual(
  motorcycle.wheels.frontRadiusM,
  0.30
);

assert.strictEqual(
  motorcycle.wheels.rearRadiusM,
  0.31
);

/* SYSTEMS */
assert.strictEqual(
  motorcycle.suspension.front.type,
  'telescopic'
);

assert.strictEqual(
  motorcycle.suspension.rear.type,
  'monoshock'
);

assert.strictEqual(
  motorcycle.brakes.front.type,
  'disc'
);

assert.strictEqual(
  motorcycle.brakes.rear.type,
  'disc'
);

/* METADATA */
assert.strictEqual(
  motorcycle.metadata.category,
  'motorcycle'
);

assert.strictEqual(
  motorcycle.metadata.configurationSource,
  'MOTORCYCLE_CORE'
);

/* INVALID INPUTS */
assert.throws(
  () => buildMotorcycleConfiguration({}),
  /missing motorcycle field/
);

assert.throws(
  () => buildMotorcycleConfiguration({
    id: 'x',
    name: 'x',
    version: '1',
    wheelbaseM: 0,
    frontWheelRadiusM: 0.3,
    rearWheelRadiusM: 0.3
  }),
  /wheelbaseM/
);

console.log('MOTORCYCLE CORE INTEGRATION: PASS');
console.log('');
console.log('Type:', motorcycle.type);
console.log('Wheelbase:', motorcycle.chassis.wheelbaseM, 'm');
console.log(
  'Front wheel radius:',
  motorcycle.wheels.frontRadiusM,
  'm'
);
console.log(
  'Rear wheel radius:',
  motorcycle.wheels.rearRadiusM,
  'm'
);
console.log('Validation: PASS');
