'use strict';

const {
  calculateEngineeringModel
} = require('../core/engineering/engineering_engine');

const {
  calculatePerformance
} = require('../core/powertrain/powertrain_engine');

/*
 * Integration adapter.
 *
 * Vehicle Core owns the vehicle definition.
 * Engineering Foundation performs calculations.
 * This layer only maps inputs and outputs.
 */
function buildEngineeringSnapshot(vehicle) {
  if (!vehicle || typeof vehicle !== 'object') {
    throw new TypeError('vehicle must be an object');
  }

  if (!Array.isArray(vehicle.components)) {
    throw new TypeError('vehicle.components must be an array');
  }

  if (!vehicle.geometry) {
    throw new TypeError('vehicle.geometry is required');
  }

  if (!vehicle.powertrain) {
    throw new TypeError('vehicle.powertrain is required');
  }

  const engineering = calculateEngineeringModel({
    components: vehicle.components,
    geometry: vehicle.geometry,
    cgHeightM: vehicle.cgHeightM
  });

  const performance = calculatePerformance({
    ...vehicle.powertrain,
    massKg: engineering.mass.totalMassKg,
    cgHeightM: engineering.centerOfGravity.heightM,
    wheelbaseM: engineering.geometry.wheelbaseM
  });

  return Object.freeze({
    vehicle: {
      id: vehicle.id,
      name: vehicle.name,
      type: vehicle.type,
      version: vehicle.version
    },
    engineering,
    performance
  });
}

module.exports = {
  buildEngineeringSnapshot
};
