'use strict';

const assert = require('assert');

const {
  buildEngineeringSnapshot
} = require('../vehicle_engineering_adapter');

const vehicle = {
  id: 'demo-motorcycle-001',
  name: 'Nexus Engineering Motorcycle',
  type: 'motorcycle',
  version: '1.0.0',

  components: [
    {
      name: 'frame',
      massKg: 100,
      xM: 0.80,
      yM: 0,
      zM: 0.50
    },
    {
      name: 'engine',
      massKg: 60,
      xM: 0.40,
      yM: 0,
      zM: 0.40
    },
    {
      name: 'battery',
      massKg: 20,
      xM: 0.20,
      yM: 0,
      zM: 0.30
    },
    {
      name: 'fuel',
      massKg: 20,
      xM: 1.00,
      yM: 0,
      zM: 0.60
    }
  ],

  geometry: {
    frontAxleXM: 0,
    rearAxleXM: 1.40,
    wheelRadiusFrontM: 0.30,
    wheelRadiusRearM: 0.31,
    groundClearanceM: 0.16
  },

  cgHeightM: 0.45,

  powertrain: {
    engineTorqueNm: 50,
    rpm: 6000,
    gearRatio: 2,
    finalDriveRatio: 3,
    drivetrainEfficiency: 0.9,
    wheelRadiusM: 0.30,
    aerodynamicForceN: 50,
    rollingResistanceN: 20
  }
};

const snapshot = buildEngineeringSnapshot(vehicle);

/* IDENTITY */
assert.strictEqual(snapshot.vehicle.id, 'demo-motorcycle-001');
assert.strictEqual(snapshot.vehicle.type, 'motorcycle');

/* ENGINEERING */
assert.strictEqual(
  snapshot.engineering.mass.totalMassKg,
  200
);

assert(
  Number.isFinite(
    snapshot.engineering.centerOfGravity.xM
  )
);

assert(
  Number.isFinite(
    snapshot.engineering.centerOfGravity.zM
  )
);

assert(
  snapshot.engineering.geometry.wheelbaseM > 0
);

assert.strictEqual(
  snapshot.engineering.validation.valid,
  true
);

/* POWERTRAIN */
assert(
  Math.abs(
    snapshot.performance.enginePowerW -
    31415.926535897932
  ) < 0.000001
);

assert.strictEqual(
  snapshot.performance.wheelTorqueNm,
  270
);

assert.strictEqual(
  snapshot.performance.tractiveForceN,
  900
);

assert(snapshot.performance.accelerationMS2 > 0);
assert(snapshot.performance.vehicleSpeedKPH > 0);
assert(snapshot.performance.powerToWeightWPerKg > 0);

/* INTEGRATION */
assert(snapshot.engineering);
assert(snapshot.performance);

console.log('VEHICLE ENGINEERING INTEGRATION: PASS');
console.log('Vehicle:', snapshot.vehicle.name);
console.log(
  'Mass:',
  snapshot.engineering.mass.totalMassKg,
  'kg'
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
