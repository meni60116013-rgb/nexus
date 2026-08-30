import type { Vehicle } from "../model/vehicle";

export function validateVehicle(vehicle: Vehicle): string[] {
  const errors: string[] = [];

  if (!vehicle.identity.id) errors.push("identity.id is required");
  if (!vehicle.identity.name) errors.push("identity.name is required");

  if (vehicle.dimensions.wheelbaseMm <= 0) {
    errors.push("wheelbaseMm must be greater than zero");
  }

  if (vehicle.dimensions.overallLengthMm <= 0) {
    errors.push("overallLengthMm must be greater than zero");
  }

  if (vehicle.dimensions.groundClearanceMm < 0) {
    errors.push("groundClearanceMm cannot be negative");
  }

  if (vehicle.mass.dryMassKg <= 0) {
    errors.push("dryMassKg must be greater than zero");
  }

  if (vehicle.mass.payloadKg < 0) {
    errors.push("payloadKg cannot be negative");
  }

  if (vehicle.mass.grossMassKg < vehicle.mass.dryMassKg) {
    errors.push("grossMassKg cannot be lower than dryMassKg");
  }

  if (vehicle.powertrain.propulsion === "ICE") {
    if (!vehicle.powertrain.displacementCc ||
        vehicle.powertrain.displacementCc <= 0) {
      errors.push("ICE vehicles require displacementCc");
    }
  }

  if (vehicle.powertrain.propulsion === "ELECTRIC") {
    if (!vehicle.powertrain.motorPowerKw ||
        vehicle.powertrain.motorPowerKw <= 0) {
      errors.push("ELECTRIC vehicles require motorPowerKw");
    }
  }

  return errors;
}
