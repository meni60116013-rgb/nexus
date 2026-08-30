'use strict';

function number(value, fallback = 0) {
  return Number.isFinite(Number(value))
    ? Number(value)
    : fallback;
}

function createUniversalVehicle(input = {}) {
  return {
    id: String(input.id || 'vehicle-001'),
    type: String(input.type || 'vehicle'),
    manufacturer: String(input.manufacturer || ''),
    model: String(input.model || ''),
    massKg: number(input.massKg),
    wheelbaseM: number(input.wheelbaseM),
    cgHeightM: number(input.cgHeightM),
    systems: {
      propulsion: input.systems?.propulsion || null,
      suspension: input.systems?.suspension || null,
      brakes: input.systems?.brakes || null,
      wheels: input.systems?.wheels || null
    },
    engineering: {
      frame: input.engineering?.frame || null,
      geometry: input.engineering?.geometry || null,
      performance: input.engineering?.performance || null
    }
  };
}

function validateUniversalVehicle(vehicle) {
  const errors = [];

  if (!vehicle || typeof vehicle !== 'object') {
    return {
      valid: false,
      errors: ['vehicle must be an object']
    };
  }

  if (!vehicle.id) errors.push('id required');
  if (!vehicle.type) errors.push('type required');

  if (!Number.isFinite(vehicle.massKg) || vehicle.massKg <= 0) {
    errors.push('massKg must be > 0');
  }

  if (!Number.isFinite(vehicle.wheelbaseM) || vehicle.wheelbaseM <= 0) {
    errors.push('wheelbaseM must be > 0');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function createVehicleSnapshot(vehicle) {
  const validation = validateUniversalVehicle(vehicle);

  return {
    schema: 'VCORE_UNIVERSAL_VEHICLE',
    version: '1.0.0',
    valid: validation.valid,
    errors: validation.errors,
    vehicle
  };
}

module.exports = {
  createUniversalVehicle,
  validateUniversalVehicle,
  createVehicleSnapshot
};
