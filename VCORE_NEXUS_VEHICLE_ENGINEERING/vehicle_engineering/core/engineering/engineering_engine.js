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

function nonNegative(name, value) {
  finite(name, value);
  if (value < 0) {
    throw new RangeError(`${name} must be >= 0`);
  }
}

/*
 * COMPONENT MASS
 *
 * components:
 * [
 *   { massKg, xM, yM, zM, name? }
 * ]
 */
function calculateMassProperties(components) {
  if (!Array.isArray(components) || components.length === 0) {
    throw new TypeError('components must be a non-empty array');
  }

  let totalMassKg = 0;
  let momentX = 0;
  let momentY = 0;
  let momentZ = 0;

  for (const component of components) {
    if (!component || typeof component !== 'object') {
      throw new TypeError('invalid component');
    }

    positive('component.massKg', component.massKg);
    finite('component.xM', component.xM);
    finite('component.yM', component.yM);
    finite('component.zM', component.zM);

    totalMassKg += component.massKg;
    momentX += component.massKg * component.xM;
    momentY += component.massKg * component.yM;
    momentZ += component.massKg * component.zM;
  }

  return Object.freeze({
    totalMassKg,
    centerOfGravityM: Object.freeze({
      xM: momentX / totalMassKg,
      yM: momentY / totalMassKg,
      zM: momentZ / totalMassKg
    })
  });
}

/*
 * WHEELBASE / BASIC VEHICLE GEOMETRY
 */
function calculateVehicleGeometry({
  frontAxleXM,
  rearAxleXM,
  wheelRadiusFrontM,
  wheelRadiusRearM,
  groundClearanceM
}) {
  finite('frontAxleXM', frontAxleXM);
  finite('rearAxleXM', rearAxleXM);
  positive('wheelRadiusFrontM', wheelRadiusFrontM);
  positive('wheelRadiusRearM', wheelRadiusRearM);
  nonNegative('groundClearanceM', groundClearanceM);

  const wheelbaseM = Math.abs(rearAxleXM - frontAxleXM);

  positive('wheelbaseM', wheelbaseM);

  return Object.freeze({
    frontAxleXM,
    rearAxleXM,
    wheelbaseM,
    wheelRadiusFrontM,
    wheelRadiusRearM,
    groundClearanceM
  });
}

/*
 * AXLE LOAD DISTRIBUTION
 *
 * For static longitudinal CG position:
 *
 * front = totalMass * rearCGDistance / wheelbase
 * rear  = totalMass * frontCGDistance / wheelbase
 */
function calculateStaticAxleLoads({
  totalMassKg,
  cgXFromFrontAxleM,
  wheelbaseM
}) {
  positive('totalMassKg', totalMassKg);
  finite('cgXFromFrontAxleM', cgXFromFrontAxleM);
  positive('wheelbaseM', wheelbaseM);

  if (
    cgXFromFrontAxleM < 0 ||
    cgXFromFrontAxleM > wheelbaseM
  ) {
    throw new RangeError(
      'cgXFromFrontAxleM must be within wheelbase'
    );
  }

  const frontMassKg =
    totalMassKg *
    (wheelbaseM - cgXFromFrontAxleM) /
    wheelbaseM;

  const rearMassKg =
    totalMassKg *
    cgXFromFrontAxleM /
    wheelbaseM;

  return Object.freeze({
    frontMassKg,
    rearMassKg,
    frontLoadFraction:
      frontMassKg / totalMassKg,
    rearLoadFraction:
      rearMassKg / totalMassKg
  });
}

/*
 * ENGINEERING VALIDATION
 */
function validateVehicleEngineering({
  totalMassKg,
  wheelbaseM,
  cgXFromFrontAxleM,
  cgHeightM,
  groundClearanceM
}) {
  const warnings = [];
  const errors = [];

  if (!Number.isFinite(totalMassKg) || totalMassKg <= 0) {
    errors.push('INVALID_TOTAL_MASS');
  }

  if (!Number.isFinite(wheelbaseM) || wheelbaseM <= 0) {
    errors.push('INVALID_WHEELBASE');
  }

  if (!Number.isFinite(cgHeightM) || cgHeightM <= 0) {
    errors.push('INVALID_CG_HEIGHT');
  }

  if (
    Number.isFinite(wheelbaseM) &&
    Number.isFinite(cgXFromFrontAxleM) &&
    (
      cgXFromFrontAxleM < 0 ||
      cgXFromFrontAxleM > wheelbaseM
    )
  ) {
    errors.push('CG_OUTSIDE_WHEELBASE');
  }

  if (
    Number.isFinite(groundClearanceM) &&
    groundClearanceM < 0
  ) {
    errors.push('INVALID_GROUND_CLEARANCE');
  }

  if (
    Number.isFinite(wheelbaseM) &&
    wheelbaseM < 0.8
  ) {
    warnings.push('VERY_SHORT_WHEELBASE');
  }

  if (
    Number.isFinite(wheelbaseM) &&
    wheelbaseM > 2.2
  ) {
    warnings.push('VERY_LONG_WHEELBASE');
  }

  if (
    Number.isFinite(cgHeightM) &&
    Number.isFinite(wheelbaseM) &&
    cgHeightM > wheelbaseM
  ) {
    warnings.push('HIGH_CG_RELATIVE_TO_WHEELBASE');
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings)
  });
}

/*
 * COMPLETE ENGINEERING MODEL
 */
function calculateEngineeringModel({
  components,
  geometry,
  cgHeightM
}) {
  positive('cgHeightM', cgHeightM);

  const mass =
    calculateMassProperties(components);

  const vehicleGeometry =
    calculateVehicleGeometry(geometry);

  const cgXFromFrontAxleM =
    mass.centerOfGravityM.xM -
    vehicleGeometry.frontAxleXM;

  const axleLoads =
    calculateStaticAxleLoads({
      totalMassKg: mass.totalMassKg,
      cgXFromFrontAxleM,
      wheelbaseM: vehicleGeometry.wheelbaseM
    });

  const validation =
    validateVehicleEngineering({
      totalMassKg: mass.totalMassKg,
      wheelbaseM: vehicleGeometry.wheelbaseM,
      cgXFromFrontAxleM,
      cgHeightM,
      groundClearanceM:
        vehicleGeometry.groundClearanceM
    });

  return Object.freeze({
    mass: Object.freeze({
      totalMassKg: mass.totalMassKg
    }),
    centerOfGravity: Object.freeze({
      xM: mass.centerOfGravityM.xM,
      yM: mass.centerOfGravityM.yM,
      zM: mass.centerOfGravityM.zM,
      xFromFrontAxleM: cgXFromFrontAxleM,
      heightM: cgHeightM
    }),
    geometry: vehicleGeometry,
    axleLoads,
    validation
  });
}

module.exports = {
  calculateMassProperties,
  calculateVehicleGeometry,
  calculateStaticAxleLoads,
  validateVehicleEngineering,
  calculateEngineeringModel
};
