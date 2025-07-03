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
  }

  durationInHours() {
    if (!this.endTime) return 0;
    const ms = this.endTime - this.startTime;
    return Math.ceil(ms / (1000 * 60 * 60)); // Round up to next hour
  }
}

module.exports = Ticket;
