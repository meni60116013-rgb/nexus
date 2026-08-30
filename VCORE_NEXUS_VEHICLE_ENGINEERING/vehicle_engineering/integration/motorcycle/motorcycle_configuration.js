'use strict';

/**
 * Motorcycle configuration adapter.
 *
 * Does not calculate engineering values.
 * It normalizes motorcycle-specific configuration
 * before passing the vehicle definition to the
 * existing Vehicle Engineering Integration adapter.
 */

const REQUIRED_FIELDS = [
  'id',
  'name',
  'version',
  'wheelbaseM',
  'frontWheelRadiusM',
  'rearWheelRadiusM'
];

function buildMotorcycleConfiguration(input) {
  if (!input || typeof input !== 'object') {
    throw new TypeError('motorcycle configuration must be an object');
  }

  for (const field of REQUIRED_FIELDS) {
    if (
      input[field] === undefined ||
      input[field] === null
    ) {
      throw new TypeError(
        `missing motorcycle field: ${field}`
      );
    }
  }

  if (input.wheelbaseM <= 0) {
    throw new RangeError(
      'wheelbaseM must be greater than zero'
    );
  }

  if (input.frontWheelRadiusM <= 0) {
    throw new RangeError(
      'frontWheelRadiusM must be greater than zero'
    );
  }

  if (input.rearWheelRadiusM <= 0) {
    throw new RangeError(
      'rearWheelRadiusM must be greater than zero'
    );
  }

  return Object.freeze({
    id: input.id,
    name: input.name,
    type: 'motorcycle',
    version: input.version,

    chassis: {
      wheelbaseM: input.wheelbaseM,
      steeringHeadAngleDeg:
        input.steeringHeadAngleDeg ?? null,
      trailM:
        input.trailM ?? null
    },

    wheels: {
      frontRadiusM: input.frontWheelRadiusM,
      rearRadiusM: input.rearWheelRadiusM
    },

    suspension: {
      front:
        input.frontSuspension ?? null,
      rear:
        input.rearSuspension ?? null
    },

    brakes: {
      front:
        input.frontBrake ?? null,
      rear:
        input.rearBrake ?? null
    },

    powertrain: input.powertrain ?? null,

    metadata: {
      category: 'motorcycle',
      configurationSource: 'MOTORCYCLE_CORE'
    }
  });
}

module.exports = {
  buildMotorcycleConfiguration
};
