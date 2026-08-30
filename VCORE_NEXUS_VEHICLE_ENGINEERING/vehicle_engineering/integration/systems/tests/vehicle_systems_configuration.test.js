'use strict';

const assert = require('assert');

const {
  buildVehicleSystemsConfiguration
} = require('../vehicle_systems_configuration');

const systems = buildVehicleSystemsConfiguration({
  wheels: {
    front: {
      radiusM: 0.30,
      widthM: 0.11,
      type: 'alloy'
    },
    rear: {
      radiusM: 0.31,
      widthM: 0.15,
      type: 'alloy'
    }
  },

  suspension: {
    front: {
      type: 'telescopic',
      travelM: 0.12,
      springRateNPerM: 18000
    },
    rear: {
      type: 'monoshock',
      travelM: 0.10,
      springRateNPerM: 22000
    }
  },

  brakes: {
    front: {
      type: 'disc',
      discDiameterM: 0.30
    },
    rear: {
      type: 'disc',
      discDiameterM: 0.24
    }
  },

  powertrain: {
    type: 'combustion',
    engineTorqueNm: 50,
    rpm: 6000
  }
});

/* WHEELS */
assert.strictEqual(
  systems.wheels.front.radiusM,
  0.30
);

assert.strictEqual(
  systems.wheels.rear.radiusM,
  0.31
);

assert.strictEqual(
  systems.wheels.front.type,
  'alloy'
);

/* SUSPENSION */
assert.strictEqual(
  systems.suspension.front.type,
  'telescopic'
);

assert.strictEqual(
  systems.suspension.rear.type,
  'monoshock'
);

assert.strictEqual(
  systems.suspension.front.travelM,
  0.12
);

assert.strictEqual(
  systems.suspension.rear.travelM,
  0.10
);

/* BRAKES */
assert.strictEqual(
  systems.brakes.front.type,
  'disc'
);

assert.strictEqual(
  systems.brakes.rear.type,
  'disc'
);

assert.strictEqual(
  systems.brakes.front.discDiameterM,
  0.30
);

/* POWERTRAIN */
assert.strictEqual(
  systems.powertrain.engineTorqueNm,
  50
);

assert.strictEqual(
  systems.powertrain.rpm,
  6000
);

/* INVALID INPUT */
assert.throws(
  () => buildVehicleSystemsConfiguration({
    wheels: {
      front: { radiusM: 0 },
      rear: { radiusM: 0.31 }
    },
    suspension: {
      front: { type: 'x', travelM: 0.1 },
      rear: { type: 'x', travelM: 0.1 }
    },
    brakes: {
      front: { type: 'disc' },
      rear: { type: 'disc' }
    },
    powertrain: {}
  }),
  /front wheel radius/
);

console.log('VEHICLE SYSTEMS CONFIGURATION: PASS');
console.log('');
console.log('Front wheel:', systems.wheels.front.radiusM, 'm');
console.log('Rear wheel:', systems.wheels.rear.radiusM, 'm');
console.log('Front suspension:', systems.suspension.front.type);
console.log('Rear suspension:', systems.suspension.rear.type);
console.log('Front brake:', systems.brakes.front.type);
console.log('Rear brake:', systems.brakes.rear.type);
console.log('Powertrain:', systems.powertrain.type);
