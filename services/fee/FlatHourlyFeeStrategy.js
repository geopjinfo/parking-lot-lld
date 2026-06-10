const FeeStrategy = require('./FeeStrategy');
const { VEHICLE_FEE_RATE } = require('../../constants/enums');
const { MS_PER_MINUTE } = require('../../constants/time');

/**
 * fee = hours * rate for the vehicle type.
 *   - a stay within `graceMinutes` is free (default 15), so pulling in and
 *     leaving without parking costs nothing
 *   - past the grace window, `minHours` sets a floor (default 1) so a genuine
 *     short stay still costs at least one hour
 */
class FlatHourlyFeeStrategy extends FeeStrategy {
  constructor(rates = VEHICLE_FEE_RATE, { minHours = 1, graceMinutes = 15 } = {}) {
    super();
    this.rates = rates;
    this.minHours = minHours;
    this.graceMinutes = graceMinutes;
  }

  calculate(ticket) {
    const rate = this.rates[ticket.vehicle.type];
    if (rate == null) {
      throw new Error(`Unknown vehicle type for fee calculation: ${ticket.vehicle.type}`);
    }
    if (ticket.endTime - ticket.startTime <= this.graceMinutes * MS_PER_MINUTE) {
      return 0; // free exit window
    }
    const hours = Math.max(this.minHours, ticket.durationInHours());
    return hours * rate;
  }
}

module.exports = FlatHourlyFeeStrategy;
