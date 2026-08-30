'use strict';

/**
 * VCORE NEXUS
 * MOTORCYCLE SYSTEMS ENGINE
 *
 * Integration layer for:
 * - Suspension / Dynamics
 * - Brakes
 * - Wheels
 * - Powertrain / Performance
 *
 * Deterministic, dependency-free.
 */

function assertObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
}

function normalizeSystem(name, system) {
  assertObject(system, name);

  return {
    id: system.id || name.toLowerCase(),
    type: name,
    enabled: system.enabled !== false,
    status: system.status || 'READY',
    version: system.version || '1.0.0'
  };
}

function createMotorcycleSystems(config = {}) {
  assertObject(config, 'config');

  return {
    suspension: normalizeSystem(
      'SUSPENSION',
      config.suspension || {}
    ),

    brakes: normalizeSystem(
      'BRAKES',
      config.brakes || {}
    ),

    wheels: normalizeSystem(
      'WHEELS',
      config.wheels || {}
    ),

    powertrain: normalizeSystem(
      'POWERTRAIN',
      config.powertrain || {}
    )
  };
}

function validateMotorcycleSystems(systems) {
  assertObject(systems, 'systems');

  const required = [
    'suspension',
    'brakes',
    'wheels',
    'powertrain'
  ];

  const errors = [];

  for (const key of required) {
    if (!systems[key]) {
      errors.push(`Missing system: ${key}`);
      continue;
    }

    if (systems[key].enabled !== true) {
      errors.push(`System disabled: ${key}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    systemCount: required.length
  };
}

function getSystemRegistry(systems) {
  assertObject(systems, 'systems');

  return Object.entries(systems).map(([key, value]) => ({
    key,
    id: value.id,
    type: value.type,
    enabled: value.enabled,
    status: value.status,
    version: value.version
  }));
}

function getMotorcycleSystemsSnapshot(systems) {
  const validation = validateMotorcycleSystems(systems);

  return {
    schema: 'VCORE_MOTORCYCLE_SYSTEMS_SNAPSHOT',
    version: '1.0.0',
    valid: validation.valid,
    errors: validation.errors,
    systems: getSystemRegistry(systems)
  };
}

module.exports = {
  createMotorcycleSystems,
  validateMotorcycleSystems,
  getSystemRegistry,
  getMotorcycleSystemsSnapshot
};
