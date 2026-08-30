'use strict';

const assert = require('assert');

const {
  buildEngineeringSnapshot
} = require('../engineering_snapshot');

const snapshot = buildEngineeringSnapshot({
  id: 'nexus-snapshot-001',
  name: 'Nexus Engineering Motorcycle',
  type: 'motorcycle',
  version: '1.0.0',

  mass: {
    totalMassKg: 200
  },

  cg: {
    xM: 0.72,
    yM: 0,
    zM: 0.45
  },

  geometry: {
    wheelbaseM: 1.4,
    frontWheelRadiusM: 0.30,
    rearWheelRadiusM: 0.31
  },

  systems: {
    wheels: {
      front: {
        radiusM: 0.30
      },
      rear: {
        radiusM: 0.31
      }
    },

    suspension: {
      front: {
        type: 'telescopic'
      },
      rear: {
        type: 'monoshock'
      }
    },

    brakes: {
      front: {
        type: 'disc'
      },
      rear: {
        type: 'disc'
      }
    },

    powertrain: {
      type: 'combustion'
    }
  },

  performance: {
    enginePowerKW: 31.41592653589793,
    wheelTorqueNm: 270,
    tractiveForceN: 900,
    accelerationMS2: 4.15,
    vehicleSpeedMS: 31.41592653589793,
    vehicleSpeedKPH: 113.09733552923255
  }
});

/* SCHEMA */
assert.strictEqual(
  snapshot.schema,
  'VCORE_ENGINEERING_SNAPSHOT'
);

assert.strictEqual(
  snapshot.schemaVersion,
  '1.0.0'
);

/* VEHICLE */
assert.strictEqual(
  snapshot.vehicle.type,
  'motorcycle'
);

assert.strictEqual(
  snapshot.vehicle.id,
  'nexus-snapshot-001'
);

/* MASS */
assert.strictEqual(
  snapshot.engineering.mass.totalMassKg,
  200
);

/* CG */
assert.strictEqual(
  snapshot.engineering.centerOfGravity.zM,
  0.45
);

/* GEOMETRY */
assert.strictEqual(
  snapshot.engineering.geometry.wheelbaseM,
  1.4
);

/* SYSTEMS */
assert.strictEqual(
  snapshot.systems.suspension.front.type,
  'telescopic'
);

assert.strictEqual(
  snapshot.systems.suspension.rear.type,
  'monoshock'
);

assert.strictEqual(
  snapshot.systems.brakes.front.type,
  'disc'
);

/* PERFORMANCE */
assert(
  snapshot.performance.enginePowerKW > 0
);

assert(
  snapshot.performance.wheelTorqueNm > 0
);

assert(
  snapshot.performance.tractiveForceN > 0
);

assert(
  snapshot.performance.vehicleSpeedKPH > 0
);

/* INVALID */
assert.throws(
  () => buildEngineeringSnapshot({
    id: 'invalid'
  }),
  /mass/
);

console.log('ENGINEERING SNAPSHOT TEST: PASS');
console.log('');
console.log('Schema:', snapshot.schema);
console.log('Vehicle:', snapshot.vehicle.type);
console.log(
  'Mass:',
  snapshot.engineering.mass.totalMassKg,
  'kg'
);
console.log(
  'Wheelbase:',
  snapshot.engineering.geometry.wheelbaseM,
  'm'
);
console.log(
  'Power:',
  snapshot.performance.enginePowerKW,
  'kW'
);
console.log(
  'Speed:',
  snapshot.performance.vehicleSpeedKPH,
  'km/h'
);
