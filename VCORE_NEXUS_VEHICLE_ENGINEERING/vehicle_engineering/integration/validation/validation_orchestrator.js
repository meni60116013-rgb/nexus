'use strict';

/*
 * VCORE NEXUS Validation Orchestrator.
 *
 * This module coordinates validation only.
 * It does not replace engineering engines.
 */

function assertObject(value, name) {
  if (!value || typeof value !== 'object') {
    throw new TypeError(`${name} must be an object`);
  }
}

function assertPositive(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be positive`);
  }
}

function validateEngineeringSnapshot(snapshot) {
  assertObject(snapshot, 'snapshot');

  const errors = [];

  if (snapshot.schema !== 'VCORE_ENGINEERING_SNAPSHOT') {
    errors.push('invalid snapshot schema');
  }

  if (!snapshot.vehicle) {
    errors.push('missing vehicle');
  }

  if (!snapshot.engineering) {
    errors.push('missing engineering');
  }

  if (!snapshot.engineering?.mass) {
    errors.push('missing mass');
  }

  if (!snapshot.engineering?.centerOfGravity) {
    errors.push('missing center of gravity');
  }

  if (!snapshot.engineering?.geometry) {
    errors.push('missing geometry');
  }

  if (!snapshot.systems) {
    errors.push('missing systems');
  }

  if (!snapshot.performance) {
    errors.push('missing performance');
  }

  if (
    snapshot.engineering?.mass &&
    Number.isFinite(snapshot.engineering.mass.totalMassKg)
  ) {
    if (snapshot.engineering.mass.totalMassKg <= 0) {
      errors.push('mass must be positive');
    }
  }

  if (
    snapshot.engineering?.geometry &&
    Number.isFinite(snapshot.engineering.geometry.wheelbaseM)
  ) {
    if (snapshot.engineering.geometry.wheelbaseM <= 0) {
      errors.push('wheelbase must be positive');
    }
  }

  const performance = snapshot.performance;

  if (performance) {
    for (const field of [
      'enginePowerKW',
      'wheelTorqueNm',
      'tractiveForceN',
      'accelerationMS2',
      'vehicleSpeedMS',
      'vehicleSpeedKPH'
    ]) {
      if (!Number.isFinite(performance[field])) {
        errors.push(`invalid performance: ${field}`);
      }
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors)
  });
}

function buildValidationReport(snapshot) {
  const validation = validateEngineeringSnapshot(snapshot);

  return Object.freeze({
    validator: 'VCORE_VALIDATION_ORCHESTRATOR',
    version: '1.0.0',
    valid: validation.valid,
    errors: validation.errors,
    vehicleId: snapshot.vehicle?.id ?? null,
    vehicleType: snapshot.vehicle?.type ?? null
  });
}

module.exports = {
  validateEngineeringSnapshot,
  buildValidationReport
};
