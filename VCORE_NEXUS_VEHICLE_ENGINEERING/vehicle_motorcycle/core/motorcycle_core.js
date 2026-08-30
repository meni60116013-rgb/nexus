'use strict';

/*
 * VCORE NEXUS — MOTORCYCLE CORE
 *
 * Especialización del Universal Vehicle Core para motocicletas.
 * Determinista, sin dependencias externas.
 */

function assertFinite(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

function assertPositive(value, name) {
  assertFinite(value, name);
  if (value <= 0) {
    throw new RangeError(`${name} must be greater than zero`);
  }
}

function calculateWheelCircumference(radiusM) {
  assertPositive(radiusM, 'radiusM');
  return 2 * Math.PI * radiusM;
}

function calculateWheelRPM(vehicleSpeedMS, wheelRadiusM) {
  assertFinite(vehicleSpeedMS, 'vehicleSpeedMS');
  assertPositive(wheelRadiusM, 'wheelRadiusM');
  return (vehicleSpeedMS / calculateWheelCircumference(wheelRadiusM)) * 60;
}

function calculateTrail({
  wheelRadiusM,
  steeringAngleDeg,
  forkOffsetM
}) {
  assertPositive(wheelRadiusM, 'wheelRadiusM');
  assertFinite(steeringAngleDeg, 'steeringAngleDeg');
  assertFinite(forkOffsetM, 'forkOffsetM');

  const angleRad = steeringAngleDeg * Math.PI / 180;

  if (Math.abs(Math.tan(angleRad)) < 1e-12) {
    throw new RangeError('steeringAngleDeg produces invalid trail geometry');
  }

  return (
    wheelRadiusM / Math.tan(angleRad)
  ) - forkOffsetM;
}

function createMotorcycleModel(input = {}) {
  const model = {
    vehicleType: 'motorcycle',
    category: input.category || 'standard',
    identity: {
      id: input.id || 'nexus-motorcycle-001',
      manufacturer: input.manufacturer || 'VCORE',
      model: input.model || 'NEXUS-MOTO'
    },
    dimensions: {
      wheelbaseM: input.wheelbaseM ?? 1.4,
      frontWheelRadiusM: input.frontWheelRadiusM ?? 0.30,
      rearWheelRadiusM: input.rearWheelRadiusM ?? 0.30,
      steeringAngleDeg: input.steeringAngleDeg ?? 25,
      forkOffsetM: input.forkOffsetM ?? 0.035
    },
    mass: {
      massKg: input.massKg ?? 200
    },
    powertrain: {
      engineType: input.engineType || 'internal-combustion',
      displacementCC: input.displacementCC ?? 0,
      enginePowerKW: input.enginePowerKW ?? 0,
      engineTorqueNm: input.engineTorqueNm ?? 0
    },
    suspension: {
      front: {
        type: input.frontSuspensionType || 'telescopic',
        travelM: input.frontSuspensionTravelM ?? 0
      },
      rear: {
        type: input.rearSuspensionType || 'swingarm',
        travelM: input.rearSuspensionTravelM ?? 0
      }
    },
    wheels: {
      front: {
        radiusM: input.frontWheelRadiusM ?? 0.30
      },
      rear: {
        radiusM: input.rearWheelRadiusM ?? 0.30
      }
    }
  };

  assertPositive(model.dimensions.wheelbaseM, 'wheelbaseM');
  assertPositive(model.dimensions.frontWheelRadiusM, 'frontWheelRadiusM');
  assertPositive(model.dimensions.rearWheelRadiusM, 'rearWheelRadiusM');
  assertPositive(model.mass.massKg, 'massKg');

  return model;
}

function validateMotorcycleModel(model) {
  const errors = [];

  if (!model || model.vehicleType !== 'motorcycle') {
    errors.push('vehicleType must be motorcycle');
  }

  if (!model?.identity?.id) {
    errors.push('identity.id is required');
  }

  if (!(model?.dimensions?.wheelbaseM > 0)) {
    errors.push('wheelbaseM must be greater than zero');
  }

  if (!(model?.mass?.massKg > 0)) {
    errors.push('massKg must be greater than zero');
  }

  if (!(model?.wheels?.front?.radiusM > 0)) {
    errors.push('front wheel radius is invalid');
  }

  if (!(model?.wheels?.rear?.radiusM > 0)) {
    errors.push('rear wheel radius is invalid');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function createMotorcycleSnapshot(model) {
  const validation = validateMotorcycleModel(model);

  return {
    schema: 'VCORE_MOTORCYCLE_SNAPSHOT',
    version: '1.0.0',
    valid: validation.valid,
    errors: validation.errors,
    vehicleType: 'motorcycle',
    identity: model.identity,
    dimensions: model.dimensions,
    mass: model.mass,
    powertrain: model.powertrain,
    suspension: model.suspension,
    wheels: model.wheels
  };
}

module.exports = {
  calculateWheelCircumference,
  calculateWheelRPM,
  calculateTrail,
  createMotorcycleModel,
  validateMotorcycleModel,
  createMotorcycleSnapshot
};
