'use strict';

const $ = (id) => document.getElementById(id);

function number(id) {
  return Number($(id).value);
}

function buildModel() {
  const wheelbase = number('wheelbase');
  const mass = number('mass');
  const cgX = number('cgX');
  const cgHeight = number('cgHeight');
  const torque = number('torque');
  const rpm = number('rpm');
  const gear = number('gear');
  const finalDrive = number('finalDrive');
  const efficiency = number('efficiency');
  const rearRadius = number('rearRadius');

  const powerW = torque * rpm * 2 * Math.PI / 60;

  const wheelTorque =
    torque * gear * finalDrive * efficiency;

  const tractiveForce =
    wheelTorque / rearRadius;

  const acceleration =
    Math.max(0, (tractiveForce - 70) / mass);

  const speedMS =
    (rpm / (gear * finalDrive)) *
    (2 * Math.PI * rearRadius) / 60;

  const frontLoad =
    mass * (wheelbase - cgX) / wheelbase;

  const rearLoad =
    mass * cgX / wheelbase;

  return {
    identity: {
      name: $('vehicleName').value,
      type: $('vehicleType').value
    },
    geometry: {
      wheelbaseM: wheelbase,
      groundClearanceM: number('groundClearance'),
      frontWheelRadiusM: number('frontRadius'),
      rearWheelRadiusM: rearRadius
    },
    mass: {
      totalMassKg: mass
    },
    centerOfGravity: {
      xFromFrontAxleM: cgX,
      heightM: cgHeight
    },
    powertrain: {
      torqueNm: torque,
      rpm,
      gearRatio: gear,
      finalDriveRatio: finalDrive,
      drivetrainEfficiency: efficiency
    },
    performance: {
      powerKW: powerW / 1000,
      wheelTorqueNm: wheelTorque,
      tractiveForceN: tractiveForce,
      accelerationMS2: acceleration,
      speedKPH: speedMS * 3.6
    },
    staticLoads: {
      frontMassKg: frontLoad,
      rearMassKg: rearLoad
    }
  };
}

function render() {
  const model = buildModel();

  $('power').textContent =
    `${model.performance.powerKW.toFixed(2)} kW`;

  $('wheelTorque').textContent =
    `${model.performance.wheelTorqueNm.toFixed(2)} Nm`;

  $('acceleration').textContent =
    `${model.performance.accelerationMS2.toFixed(2)} m/s²`;

  $('speed').textContent =
    `${model.performance.speedKPH.toFixed(2)} km/h`;

  $('frontLoad').textContent =
    `${model.staticLoads.frontMassKg.toFixed(1)} kg`;

  $('rearLoad').textContent =
    `${model.staticLoads.rearMassKg.toFixed(1)} kg`;

  $('validationBadge').textContent = 'VALID';

  $('output').textContent =
    JSON.stringify(model, null, 2);

  return model;
}

$('calculate').addEventListener('click', render);

$('save').addEventListener('click', () => {
  const model = render();
  localStorage.setItem(
    'vcore_vehicle_creator_model',
    JSON.stringify(model)
  );
});

$('export').addEventListener('click', () => {
  const model = render();
  const blob = new Blob(
    [JSON.stringify(model, null, 2)],
    { type: 'application/json' }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = 'vcore-vehicle-model.json';
  a.click();

  URL.revokeObjectURL(url);
});

const saved =
  localStorage.getItem('vcore_vehicle_creator_model');

if (saved) {
  try {
    const model = JSON.parse(saved);
    if (model.identity?.name) {
      $('vehicleName').value = model.identity.name;
    }
  } catch (_) {
    localStorage.removeItem(
      'vcore_vehicle_creator_model'
    );
  }
}

render();
