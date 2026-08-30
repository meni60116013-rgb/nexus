'use strict';

const {
  calculateEngineeringModel
} = require('../core/engineering/engineering_engine');

const {
  calculatePerformance
} = require('../core/powertrain/powertrain_engine');

function buildDemonstratorModel() {
  const engineering = calculateEngineeringModel({
    components: [
      {
        name: 'frame',
        massKg: 100,
        xM: 0.80,
        yM: 0,
        zM: 0.50
      },
      {
        name: 'engine',
        massKg: 60,
        xM: 0.40,
        yM: 0,
        zM: 0.40
      },
      {
        name: 'battery',
        massKg: 20,
        xM: 0.20,
        yM: 0,
        zM: 0.30
      },
      {
        name: 'fuel',
        massKg: 20,
        xM: 1.00,
        yM: 0,
        zM: 0.60
      }
    ],
    geometry: {
      frontAxleXM: 0,
      rearAxleXM: 1.40,
      wheelRadiusFrontM: 0.30,
      wheelRadiusRearM: 0.31,
      groundClearanceM: 0.16
    },
    cgHeightM: 0.45
  });

  const performance = calculatePerformance({
    engineTorqueNm: 50,
    rpm: 6000,
    gearRatio: 2,
    finalDriveRatio: 3,
    drivetrainEfficiency: 0.9,
    wheelRadiusM: 0.30,
    massKg: engineering.mass.totalMassKg,
    aerodynamicForceN: 50,
    rollingResistanceN: 20,
    cgHeightM: engineering.centerOfGravity.heightM,
    wheelbaseM: engineering.geometry.wheelbaseM
  });

  return Object.freeze({
    demonstrator: 'VCORE_NEXUS_FIRST_DEMONSTRATOR',
    version: '1.0.1',
    vehicle: {
      name: 'Nexus Engineering Motorcycle',
      type: 'motorcycle'
    },
    engineering,
    performance,
    systemStatus: {
      vehicleCore: 'OK',
      motorcycleCore: 'OK',
      tubularEngineering: 'OK',
      vehicleSystems: 'OK',
      engineeringEngine: 'OK',
      vehicleCreatorUI: 'OK',
      powertrainPerformance: 'OK'
    }
  });
}

module.exports = {
  buildDemonstratorModel
};
