'use strict';

const {
  createVehicle
} = require('../vehicle_core');

function adaptUniversalVehicle(source = {}) {
  return createVehicle({
    id: source.id,
    type: source.type,
    manufacturer: source.manufacturer,
    model: source.model,
    massKg: source.massKg,
    wheelbaseM: source.wheelbaseM,
    cgHeightM: source.cgHeightM,
    systems: source.systems,
    engineering: source.engineering
  });
}

module.exports = {
  adaptUniversalVehicle
};
