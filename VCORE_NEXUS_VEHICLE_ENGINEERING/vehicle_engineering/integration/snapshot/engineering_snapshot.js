'use strict';

/*
 * Universal Engineering Snapshot.
 *
 * This module is an integration/orchestration layer.
 * It does not replace or duplicate engineering engines.
 */

function requireObject(value, name) {
  if (!value || typeof value !== 'object') {
    throw new TypeError(`${name} must be an object`);
  }
}

function finite(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

function buildEngineeringSnapshot(input) {
  requireObject(input, 'vehicle');

  const vehicle = {
    id: input.id,
    name: input.name,
    type: input.type,
    version: input.version
  };

  requireObject(input.mass, 'mass');
  requireObject(input.cg, 'cg');
  requireObject(input.geometry, 'geometry');
  requireObject(input.systems, 'systems');
  requireObject(input.performance, 'performance');

  finite(input.mass.totalMassKg, 'mass.totalMassKg');
  finite(input.cg.xM, 'cg.xM');
  finite(input.cg.yM, 'cg.yM');
  finite(input.cg.zM, 'cg.zM');
  finite(input.geometry.wheelbaseM, 'geometry.wheelbaseM');

  if (input.mass.totalMassKg <= 0) {
    throw new RangeError('mass.totalMassKg must be greater than zero');
  }

  if (input.geometry.wheelbaseM <= 0) {
    throw new RangeError(
      'geometry.wheelbaseM must be greater than zero'
    );
  }

  return Object.freeze({
    schema: 'VCORE_ENGINEERING_SNAPSHOT',
    schemaVersion: '1.0.0',

    vehicle: Object.freeze(vehicle),

    engineering: Object.freeze({
      mass: Object.freeze({
        totalMassKg: input.mass.totalMassKg
      }),

      centerOfGravity: Object.freeze({
        xM: input.cg.xM,
        yM: input.cg.yM,
        zM: input.cg.zM
      }),

      geometry: Object.freeze({
        wheelbaseM: input.geometry.wheelbaseM,
        frontWheelRadiusM:
          input.geometry.frontWheelRadiusM ?? null,
        rearWheelRadiusM:
          input.geometry.rearWheelRadiusM ?? null
      })
    }),

    systems: input.systems,

    performance: input.performance,

    metadata: Object.freeze({
      source: 'VEHICLE_ENGINEERING_FOUNDATION',
      integrationLayer: 'UNIVERSAL_ENGINEERING_SNAPSHOT'
    })
  });
}

module.exports = {
  buildEngineeringSnapshot
};
