'use strict';

const assert = require('assert');

const {
  calculateMassProperties,
  calculateVehicleGeometry,
  calculateStaticAxleLoads,
  validateVehicleEngineering,
  calculateEngineeringModel
} = require('../engineering_engine');

function close(actual, expected, tolerance = 0.000001) {
  return Math.abs(actual - expected) <= tolerance;
}

/* MASS + CG */
const mass = calculateMassProperties([
  {
    name: 'frame',
    massKg: 100,
    xM: 0.8,
    yM: 0,
    zM: 0.5
  },
  {
    name: 'engine',
    massKg: 60,
    xM: 0.4,
    yM: 0,
    zM: 0.4
  },
  {
    name: 'battery',
    massKg: 20,
    xM: 0.2,
    yM: 0,
    zM: 0.3
  },
  {
    name: 'fuel',
    massKg: 20,
    xM: 1.0,
    yM: 0,
    zM: 0.6
  }
]);

assert.strictEqual(mass.totalMassKg, 200);
assert(close(
  mass.centerOfGravityM.xM,
  0.61
));
assert.strictEqual(
  mass.centerOfGravityM.yM,
  0
);
assert(close(
  mass.centerOfGravityM.zM,
  0.45
));

/* GEOMETRY */
const geometry = calculateVehicleGeometry({
  frontAxleXM: 0,
  rearAxleXM: 1.4,
  wheelRadiusFrontM: 0.30,
  wheelRadiusRearM: 0.31,
  groundClearanceM: 0.16
});

assert.strictEqual(geometry.wheelbaseM, 1.4);

/* STATIC AXLE LOAD */
const loads = calculateStaticAxleLoads({
  totalMassKg: 200,
  cgXFromFrontAxleM: 0.61,
  wheelbaseM: 1.4
});

assert(close(
  loads.frontMassKg,
  112.85714285714286
));

assert(close(
  loads.rearMassKg,
  87.14285714285714
));

assert(close(
  loads.frontMassKg + loads.rearMassKg,
  200
));

/* VALIDATION */
const validation = validateVehicleEngineering({
  totalMassKg: 200,
  wheelbaseM: 1.4,
  cgXFromFrontAxleM: 0.61,
  cgHeightM: 0.45,
  groundClearanceM: 0.16
});

assert.strictEqual(validation.valid, true);
assert.strictEqual(validation.errors.length, 0);

/* COMPLETE MODEL */
const model = calculateEngineeringModel({
  components: [
    {
      name: 'frame',
      massKg: 100,
      xM: 0.8,
      yM: 0,
      zM: 0.5
    },
    {
      name: 'engine',
      massKg: 60,
      xM: 0.4,
      yM: 0,
      zM: 0.4
    },
    {
      name: 'battery',
      massKg: 20,
      xM: 0.2,
      yM: 0,
      zM: 0.3
    },
    {
      name: 'fuel',
      massKg: 20,
      xM: 1.0,
      yM: 0,
      zM: 0.6
    }
  ],
  geometry: {
    frontAxleXM: 0,
    rearAxleXM: 1.4,
    wheelRadiusFrontM: 0.30,
    wheelRadiusRearM: 0.31,
    groundClearanceM: 0.16
  },
  cgHeightM: 0.45
});

assert.strictEqual(model.mass.totalMassKg, 200);
assert(close(
  model.centerOfGravity.xM,
  0.61
));
assert.strictEqual(
  model.geometry.wheelbaseM,
  1.4
);
assert.strictEqual(
  model.validation.valid,
  true
);

console.log('ENGINEERING ENGINE TESTS: PASS');
console.log('');
console.log('Total mass:', model.mass.totalMassKg, 'kg');
console.log(
  'CG X:',
  model.centerOfGravity.xM,
  'm'
);
console.log(
  'CG Z:',
  model.centerOfGravity.zM,
  'm'
);
console.log(
  'Wheelbase:',
  model.geometry.wheelbaseM,
  'm'
);
console.log(
  'Front static mass:',
  model.axleLoads.frontMassKg,
  'kg'
);
console.log(
  'Rear static mass:',
  model.axleLoads.rearMassKg,
  'kg'
);
console.log(
  'Validation:',
  model.validation.valid ? 'PASS' : 'FAIL'
);
