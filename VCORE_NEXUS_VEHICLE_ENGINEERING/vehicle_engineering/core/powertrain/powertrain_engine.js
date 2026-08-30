'use strict';

function finite(name, value) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be finite`);
  }
}

function positive(name, value) {
  finite(name, value);
  if (value <= 0) {
    throw new RangeError(`${name} must be > 0`);
  }
}

function efficiency(value) {
  positive('drivetrainEfficiency', value);
  if (value > 1) {
    throw new RangeError('drivetrainEfficiency must be <= 1');
  }
  return value;
}

function calculatePowerW(torqueNm, rpm) {
  positive('torqueNm', torqueNm);
  positive('rpm', rpm);
  return torqueNm * rpm * 2 * Math.PI / 60;
}

function calculateWheelTorque({
  engineTorqueNm,
  gearRatio,
  finalDriveRatio,
  drivetrainEfficiency = 0.9
}) {
  positive('engineTorqueNm', engineTorqueNm);
  positive('gearRatio', gearRatio);
  positive('finalDriveRatio', finalDriveRatio);
  efficiency(drivetrainEfficiency);

  return engineTorqueNm *
    gearRatio *
    finalDriveRatio *
    drivetrainEfficiency;
}

function calculateTractiveForce(wheelTorqueNm, wheelRadiusM) {
  positive('wheelTorqueNm', wheelTorqueNm);
  positive('wheelRadiusM', wheelRadiusM);
  return wheelTorqueNm / wheelRadiusM;
}

function calculatePowerToWeight(powerW, massKg) {
  positive('powerW', powerW);
  positive('massKg', massKg);
  return powerW / massKg;
}

function calculateAcceleration({
  tractiveForceN,
  massKg,
  aerodynamicForceN = 0,
  rollingResistanceN = 0
}) {
  positive('tractiveForceN', tractiveForceN);
  positive('massKg', massKg);
  finite('aerodynamicForceN', aerodynamicForceN);
  finite('rollingResistanceN', rollingResistanceN);

  return Math.max(
    0,
    (tractiveForceN - aerodynamicForceN - rollingResistanceN) / massKg
  );
}

function calculateVehicleSpeed({
  wheelRadiusM,
  rpm,
  gearRatio,
  finalDriveRatio
}) {
  positive('wheelRadiusM', wheelRadiusM);
  positive('rpm', rpm);
  positive('gearRatio', gearRatio);
  positive('finalDriveRatio', finalDriveRatio);

  const wheelRPM = rpm / (gearRatio * finalDriveRatio);
  const circumferenceM = 2 * Math.PI * wheelRadiusM;

  return wheelRPM * circumferenceM / 60;
}

function calculateLongitudinalLoadTransfer({
  massKg,
  accelerationMS2,
  cgHeightM,
  wheelbaseM
}) {
  positive('massKg', massKg);
  finite('accelerationMS2', accelerationMS2);
  positive('cgHeightM', cgHeightM);
  positive('wheelbaseM', wheelbaseM);

  return massKg * accelerationMS2 * cgHeightM / wheelbaseM;
}

function calculatePerformance(input) {
  const {
    engineTorqueNm,
    rpm,
    gearRatio,
    finalDriveRatio,
    drivetrainEfficiency = 0.9,
    wheelRadiusM,
    massKg,
    aerodynamicForceN = 0,
    rollingResistanceN = 0,
    cgHeightM,
    wheelbaseM
  } = input;

  const enginePowerW =
    calculatePowerW(engineTorqueNm, rpm);

  const wheelTorqueNm =
    calculateWheelTorque({
      engineTorqueNm,
      gearRatio,
      finalDriveRatio,
      drivetrainEfficiency
    });

  const tractiveForceN =
    calculateTractiveForce(
      wheelTorqueNm,
      wheelRadiusM
    );

  const accelerationMS2 =
    calculateAcceleration({
      tractiveForceN,
      massKg,
      aerodynamicForceN,
      rollingResistanceN
    });

  const vehicleSpeedMS =
    calculateVehicleSpeed({
      wheelRadiusM,
      rpm,
      gearRatio,
      finalDriveRatio
    });

  const longitudinalLoadTransferN =
    calculateLongitudinalLoadTransfer({
      massKg,
      accelerationMS2,
      cgHeightM,
      wheelbaseM
    });

  return Object.freeze({
    rpm,
    engineTorqueNm,
    enginePowerW,
    enginePowerKW: enginePowerW / 1000,
    wheelTorqueNm,
    tractiveForceN,
    accelerationMS2,
    vehicleSpeedMS,
    vehicleSpeedKPH: vehicleSpeedMS * 3.6,
    powerToWeightWPerKg:
      calculatePowerToWeight(enginePowerW, massKg),
    longitudinalLoadTransferN
  });
}

module.exports = {
  calculatePowerW,
  calculateWheelTorque,
  calculateTractiveForce,
  calculatePowerToWeight,
  calculateAcceleration,
  calculateVehicleSpeed,
  calculateLongitudinalLoadTransfer,
  calculatePerformance
};
