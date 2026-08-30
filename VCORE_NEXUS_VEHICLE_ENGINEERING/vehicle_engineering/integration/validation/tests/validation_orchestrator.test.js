'use strict';

const assert = require('assert');

const {
  validateEngineeringSnapshot,
  buildValidationReport
} = require('../validation_orchestrator');

const validSnapshot = {
  schema: 'VCORE_ENGINEERING_SNAPSHOT',
  schemaVersion: '1.0.0',

  vehicle: {
    id: 'nexus-validation-001',
    name: 'Nexus Motorcycle',
    type: 'motorcycle',
    version: '1.0.0'
  },

  engineering: {
    mass: {
      totalMassKg: 200
    },

    centerOfGravity: {
      xM: 0.72,
      yM: 0,
      zM: 0.45
    },

    geometry: {
      wheelbaseM: 1.4,
      frontWheelRadiusM: 0.30,
      rearWheelRadiusM: 0.31
    }
  },

  systems: {
    wheels: {},
    suspension: {},
    brakes: {},
    powertrain: {}
  },

  performance: {
    enginePowerKW: 31.41592653589793,
    wheelTorqueNm: 270,
    tractiveForceN: 900,
    accelerationMS2: 4.15,
    vehicleSpeedMS: 31.41592653589793,
    vehicleSpeedKPH: 113.09733552923255
  }
};

/* VALID */
const validation = validateEngineeringSnapshot(
  validSnapshot
);

assert.strictEqual(
  validation.valid,
  true
);

assert.strictEqual(
  validation.errors.length,
  0
);

/* REPORT */
const report = buildValidationReport(
  validSnapshot
);

assert.strictEqual(
  report.valid,
  true
);

assert.strictEqual(
  report.vehicleId,
  'nexus-validation-001'
);

assert.strictEqual(
  report.vehicleType,
  'motorcycle'
);

/* INVALID */
const invalidSnapshot = {
  schema: 'INVALID'
};

const invalid = validateEngineeringSnapshot(
  invalidSnapshot
);

assert.strictEqual(
  invalid.valid,
  false
);

assert(
  invalid.errors.length > 0
);

console.log('VALIDATION ORCHESTRATOR TEST: PASS');
console.log('');
console.log('Valid snapshot:', validation.valid);
console.log('Errors:', validation.errors.length);
console.log('Vehicle:', report.vehicleId);
console.log('Invalid snapshot rejected:', !invalid.valid);
