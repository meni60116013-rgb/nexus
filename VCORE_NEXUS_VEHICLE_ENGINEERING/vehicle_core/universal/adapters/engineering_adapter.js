'use strict';

const {
  createUniversalVehicle,
  createVehicleSnapshot
} = require('../universal_vehicle_core');

function adaptEngineeringVehicle(source = {}) {
  return createVehicleSnapshot(
    createUniversalVehicle({
      id: source.id || source.vehicleId,
      type: source.type || source.vehicleType || 'vehicle',
      manufacturer: source.manufacturer,
      model: source.model,
      massKg: source.massKg ?? source.mass,
      wheelbaseM: source.wheelbaseM ?? source.wheelbase,
      cgHeightM: source.cgHeightM,
      systems: source.systems,
      engineering: source.engineering
    })
  );
}

module.exports = {
  adaptEngineeringVehicle
};
