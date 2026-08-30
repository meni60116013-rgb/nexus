'use strict';

/*
 * Vehicle Systems Configuration Layer.
 *
 * This layer owns configuration and normalization only.
 * Physics remain inside the existing specialized engines.
 */

function requireObject(value, name) {
  if (!value || typeof value !== 'object') {
    throw new TypeError(`${name} must be an object`);
  }
}

function positive(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(
      `${name} must be greater than zero`
    );
  }
}

function buildVehicleSystemsConfiguration(input) {
  requireObject(input, 'systems');

  requireObject(input.wheels, 'wheels');
  requireObject(input.suspension, 'suspension');
  requireObject(input.brakes, 'brakes');
  requireObject(input.powertrain, 'powertrain');

  positive(input.wheels.front.radiusM, 'front wheel radius');
  positive(input.wheels.rear.radiusM, 'rear wheel radius');

  positive(
    input.suspension.front.travelM,
    'front suspension travel'
  );

  positive(
    input.suspension.rear.travelM,
    'rear suspension travel'
  );

  const result = {
    wheels: {
      front: {
        radiusM: input.wheels.front.radiusM,
        widthM: input.wheels.front.widthM ?? null,
        type: input.wheels.front.type ?? 'standard'
      },
      rear: {
        radiusM: input.wheels.rear.radiusM,
        widthM: input.wheels.rear.widthM ?? null,
        type: input.wheels.rear.type ?? 'standard'
      }
    },

    suspension: {
      front: {
        type: input.suspension.front.type,
        travelM: input.suspension.front.travelM,
        springRateNPerM:
          input.suspension.front.springRateNPerM ?? null
      },
      rear: {
        type: input.suspension.rear.type,
        travelM: input.suspension.rear.travelM,
        springRateNPerM:
          input.suspension.rear.springRateNPerM ?? null
      }
    },

    brakes: {
      front: {
        type: input.brakes.front.type,
        discDiameterM:
          input.brakes.front.discDiameterM ?? null
      },
      rear: {
        type: input.brakes.rear.type,
        discDiameterM:
          input.brakes.rear.discDiameterM ?? null
      }
    },

    powertrain: {
      type: input.powertrain.type ?? 'combustion',
      engineTorqueNm:
        input.powertrain.engineTorqueNm,
      rpm:
        input.powertrain.rpm
    }
  };

  return Object.freeze(result);
}

module.exports = {
  buildVehicleSystemsConfiguration
};
