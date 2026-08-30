'use strict';

const {
  createMotorcycleSystems,
  validateMotorcycleSystems,
  getMotorcycleSystemsSnapshot
} = require('../motorcycle_systems_engine');

function integrateMotorcycleSystems(input = {}) {
  const systems = createMotorcycleSystems(input);

  const validation = validateMotorcycleSystems(systems);

  return {
    schema: 'VCORE_MOTORCYCLE_SYSTEMS_INTEGRATION',
    version: '1.0.0',
    integrationStatus: validation.valid ? 'PASS' : 'FAIL',
    validation,
    snapshot: getMotorcycleSystemsSnapshot(systems)
  };
}

module.exports = {
  integrateMotorcycleSystems
};
