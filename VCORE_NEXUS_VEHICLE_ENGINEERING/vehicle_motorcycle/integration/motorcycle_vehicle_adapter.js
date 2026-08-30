'use strict';

const {
  createMotorcycleModel,
  validateMotorcycleModel,
  createMotorcycleSnapshot
} = require('../core/motorcycle_core');

function adaptVehicleToMotorcycle(vehicle = {}) {
  const source = vehicle.configuration || vehicle;

  const motorcycle = createMotorcycleModel({
    id: vehicle.id || source.id || 'nexus-motorcycle-001',
    category: source.category || 'standard',
    manufacturer: source.manufacturer || 'VCORE',
    model: source.model || 'NEXUS-MOTO',
    wheelbaseM: source.wheelbaseM ?? 1.4,
    frontWheelRadiusM: source.frontWheelRadiusM ?? 0.30,
    rearWheelRadiusM: source.rearWheelRadiusM ?? 0.30,
    steeringAngleDeg: source.steeringAngleDeg ?? 25,
    forkOffsetM: source.forkOffsetM ?? 0.035,
    massKg: source.massKg ?? 200,
    engineType: source.engineType || 'internal-combustion',
    displacementCC: source.displacementCC ?? 0,
    enginePowerKW: source.enginePowerKW ?? 0,
    engineTorqueNm: source.engineTorqueNm ?? 0
  });

  return {
    sourceType: vehicle.vehicleType || 'vehicle',
    targetType: 'motorcycle',
    motorcycle,
    validation: validateMotorcycleModel(motorcycle),
    snapshot: createMotorcycleSnapshot(motorcycle)
  };
}

module.exports = {
  adaptVehicleToMotorcycle
};
