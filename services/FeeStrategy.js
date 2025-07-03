const { VEHICLE_FEE_RATE } = require('../constants/enums');

class FeeStrategy {
  static calculate(vehicleType, hours) {
    const rate = VEHICLE_FEE_RATE[vehicleType];
    if (rate == null) {
      throw new Error(`Unknown vehicle type for fee calculation: ${vehicleType}`);
    }
    return hours * rate;
  }
}

module.exports = FeeStrategy;
