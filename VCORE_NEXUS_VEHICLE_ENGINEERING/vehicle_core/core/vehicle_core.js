'use strict';

const {
  createUniversalVehicle
} = require('../universal/universal_vehicle_core');

function createVehicle(config = {}) {
  const vehicle = createUniversalVehicle(config);

  return {
    ...vehicle,

    identity: {
      id: vehicle.id,
      type: vehicle.type,
      manufacturer: vehicle.manufacturer,
      model: vehicle.model
    },

    configuration: {
      massKg: vehicle.massKg,
      wheelbaseM: vehicle.wheelbaseM,
      cgHeightM: vehicle.cgHeightM
    },

    systems: {
      propulsion: vehicle.systems.propulsion,
      suspension: vehicle.systems.suspension,
      brakes: vehicle.systems.brakes,
      wheels: vehicle.systems.wheels
    },

    state: {
      lifecycle: 'configured',
      ready: false,
      revision: 1
    }
  };
}

function updateVehicleState(vehicle, patch = {}) {
  return {
    ...vehicle,
    state: {
      ...vehicle.state,
      ...patch,
      revision: (vehicle.state?.revision || 0) + 1
    }
  };
}

function markVehicleReady(vehicle) {
  return updateVehicleState(vehicle, {
    lifecycle: 'ready',
    ready: true
  });
}

function getVehicleSummary(vehicle) {
  return {
    id: vehicle.identity.id,
    type: vehicle.identity.type,
    model: vehicle.identity.model,
    massKg: vehicle.configuration.massKg,
    wheelbaseM: vehicle.configuration.wheelbaseM,
    lifecycle: vehicle.state.lifecycle,
    ready: vehicle.state.ready,
    revision: vehicle.state.revision
  };
}

module.exports = {
  createVehicle,
  updateVehicleState,
  markVehicleReady,
  getVehicleSummary
};
