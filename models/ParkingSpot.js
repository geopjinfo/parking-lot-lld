const EventEmitter = require('events');
const { SPOT_TYPE } = require('../constants/enums');

/**
 * A single slot. Fires 'assigned'/'released' so floors and the lot can keep
 * availability up to date. Always claim with tryAssign, never check-then-set.
 */
class ParkingSpot extends EventEmitter {
  constructor(id, type) {
    super();
    if (!Object.values(SPOT_TYPE).includes(type)) {
      throw new Error(`Invalid spot type: ${type}`);
    }
    this.id = id;
    this.type = type;
    this.occupied = false;
    this.vehicle = null;
  }

  /** Take the spot in one step. Returns false if it's already taken. */
  tryAssign(vehicle) {
    if (this.occupied) return false;
    this.occupied = true;
    this.vehicle = vehicle;
    this.emit('assigned', this);
    return true;
  }

  /** Free the spot and return the vehicle that left (null if it was empty). */
  release() {
    if (!this.occupied) return null;
    const vehicle = this.vehicle;
    this.occupied = false;
    this.vehicle = null;
    this.emit('released', this);
    return vehicle;
  }

  isAvailable() {
    return !this.occupied;
  }
}

module.exports = ParkingSpot;
