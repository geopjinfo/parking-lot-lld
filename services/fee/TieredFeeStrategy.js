const FeeStrategy = require('./FeeStrategy');
const { VEHICLE_FEE_RATE } = require('../../constants/enums');
const { MS_PER_MINUTE } = require('../../constants/time');

/**
 * A second pricing option, here to show the strategy is swappable:
 *   - a stay within `graceMinutes` is free (default 15), so a quick in-and-out
 *     costs nothing
 *   - the first `freeHours` are then free (grace period)
 *   - the rest charge the flat rate
 *   - each 24h is capped at `dailyCapHours * rate`
 * With { freeHours: 0, dailyCapHours: 24 } it's just flat hourly.
 */
class TieredFeeStrategy extends FeeStrategy {
  constructor(rates = VEHICLE_FEE_RATE, { freeHours = 1, dailyCapHours = 12, graceMinutes = 15 } = {}) {
    super();
    this.rates = rates;
    this.freeHours = freeHours;
    this.dailyCapHours = dailyCapHours;
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

    const parkedHours = Math.max(1, ticket.durationInHours());
    const billable = Math.max(0, parkedHours - this.freeHours);

    const dailyCap = this.dailyCapHours * rate;
    const fullDays = Math.floor(billable / 24);
    const leftoverHours = billable % 24;

    return fullDays * dailyCap + Math.min(leftoverHours * rate, dailyCap);
  }
}

module.exports = TieredFeeStrategy;
