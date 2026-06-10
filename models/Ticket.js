const { MS_PER_HOUR } = require('../constants/time');

/**
 * One parking stay: entry/exit times and how long it lasted. Pricing rules
 * (minimum charge, tiers) live in the fee strategy, not here.
 */
class Ticket {
  constructor(id, vehicle, spot, startTime) {
    this.id = id;
    this.vehicle = vehicle;
    this.spot = spot;
    this.startTime = startTime;
    this.endTime = null;
  }

  close(endTime) {
    this.endTime = endTime;
    return this;
  }

  get isClosed() {
    return this.endTime != null;
  }

  /** Hours parked, rounded up. 0 while the ticket is still open. */
  durationInHours() {
    if (this.endTime == null) return 0;
    return Math.ceil((this.endTime - this.startTime) / MS_PER_HOUR);
  }
}

module.exports = Ticket;
