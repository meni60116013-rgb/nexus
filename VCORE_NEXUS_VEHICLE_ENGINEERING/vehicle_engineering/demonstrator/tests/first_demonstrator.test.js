'use strict';

const assert = require('assert');

const {
  buildDemonstratorModel
} = require('../integration_engine');

function finite(value) {
  return Number.isFinite(value);
}

function positive(value) {
  return finite(value) && value > 0;
}

const model = buildDemonstratorModel();

console.log('');
console.log('===== FIRST DEMONSTRATOR REAL VALUES =====');
console.log(
  JSON.stringify(
    {
      massKg: model.engineering.mass.totalMassKg,
      cg: model.engineering.centerOfGravity,
      geometry: model.engineering.geometry,
      powertrain: model.performance
    },
    null,
    2
  )
);
console.log('==========================================');
console.log('');

/* IDENTIDAD */
assert.strictEqual(
  model.demonstrator,
  'VCORE_NEXUS_FIRST_DEMONSTRATOR'
);

assert.strictEqual(
  model.vehicle.type,
  'motorcycle'
);

/* MASS */
assert.strictEqual(
  model.engineering.mass.totalMassKg,
  200
);

assert(
  positive(model.engineering.mass.totalMassKg)
);

/* CENTER OF GRAVITY */
/*
 * No se fija artificialmente X/Z.
 * Se valida que el engine produzca un CG físico,
 * finito y contenido dentro de la geometría.
 */
assert(
  finite(model.engineering.centerOfGravity.xM)
);

assert(
  finite(model.engineering.centerOfGravity.yM)
);

assert(
  finite(model.engineering.centerOfGravity.zM)
);

assert(
  model.engineering.centerOfGravity.xM >= 0
);

assert(
  model.engineering.centerOfGravity.xM <=
  model.engineering.geometry.wheelbaseM
);

assert(
  model.engineering.centerOfGravity.zM >= 0
);

/* GEOMETRY */
assert(
  positive(model.engineering.geometry.wheelbaseM)
);

assert.strictEqual(
  model.engineering.geometry.wheelbaseM,
  1.4
);

/* ENGINEERING VALIDATION */
assert.strictEqual(
  model.engineering.validation.valid,
  true
);

/* POWERTRAIN — VALUES ESTABLES DEL ENGINE */
assert(
  positive(model.performance.enginePowerW)
);

assert(
  Math.abs(
    model.performance.enginePowerW -
    31415.926535897932
  ) < 0.000001
);

assert(
  Math.abs(
    model.performance.enginePowerKW -
    31.41592653589793
  ) < 0.000001
);

assert.strictEqual(
  model.performance.wheelTorqueNm,
  270
);

assert.strictEqual(
  model.performance.tractiveForceN,
  900
);

assert(
  Math.abs(
    model.performance.vehicleSpeedMS -
    31.41592653589793
  ) < 0.000001
);

assert(
  Math.abs(
    model.performance.vehicleSpeedKPH -
    113.09733552923255
  ) < 0.000001
);

assert(
  positive(model.performance.accelerationMS2)
);

assert(
  positive(model.performance.powerToWeightWPerKg)
);

assert(
  positive(model.performance.longitudinalLoadTransferN)
);

/* SYSTEM INTEGRATION */
const expectedSystems = [
  'vehicleCore',
  'motorcycleCore',
  'tubularEngineering',
  'vehicleSystems',
  'engineeringEngine',
  'vehicleCreatorUI',
  'powertrainPerformance'
];

for (const system of expectedSystems) {
  assert.strictEqual(
    model.systemStatus[system],
    'OK',
    `${system}: integration failure`
  );
}

/* FINAL */
console.log('FIRST DEMONSTRATOR TEST: PASS');
console.log('');
console.log('Mass:', model.engineering.mass.totalMassKg, 'kg');
console.log(
  'CG X:',
  model.engineering.centerOfGravity.xM,
  'm'
);
console.log(
  'CG Z:',
  model.engineering.centerOfGravity.zM,
  'm'
);
console.log(
  'Wheelbase:',
  model.engineering.geometry.wheelbaseM,
  'm'
);
console.log(
  'Power:',
  model.performance.enginePowerKW,
  'kW'
);
console.log(
  'Wheel torque:',
  model.performance.wheelTorqueNm,
  'Nm'
);
console.log(
  'Acceleration:',
  model.performance.accelerationMS2,
  'm/s²'
);
console.log(
  'Speed:',
  model.performance.vehicleSpeedKPH,
  'km/h'
);
console.log(
  'Load transfer:',
  model.performance.longitudinalLoadTransferN,
  'N'
);
console.log('');
console.log('INTEGRATION: PASS');
