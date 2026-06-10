const EventEmitter = require('events');

/**
 * Holds the floors and the active tickets. Re-fires 'availabilityChanged' when
 * any spot fills or empties, so listeners (a dashboard, a log) don't have to
 * poll. Plain class, not a singleton, so tests stay isolated.
 */
class ParkingLot extends EventEmitter {
  constructor() {
    super();
    this.floors = [];
    this.activeTickets = new Map(); // Map<ticketId, Ticket>
  }

  addFloor(floor) {
    this.floors.push(floor);
    // Added after the floor's own listeners, so counts are already current
    // when we read them here.
    for (const spot of floor.spots) {
      const broadcast = () => this._emitAvailability(floor, spot);
      spot.on('assigned', broadcast);
      spot.on('released', broadcast);
    }
    return this;
  }

  _emitAvailability(floor, spot) {
    this.emit('availabilityChanged', {
      floor: floor.floorNumber,
      type: spot.type,
      available: floor.countAvailable(spot.type),
      total: floor.countTotal(spot.type),
    });
  }

  addTicket(ticket) {
    this.activeTickets.set(ticket.id, ticket);
  }

  getTicket(ticketId) {
    return this.activeTickets.get(ticketId);
  }

  closeTicket(ticketId) {
    const ticket = this.activeTickets.get(ticketId);
    this.activeTickets.delete(ticketId);
    return ticket;
  }

  /** Availability across every floor. */
  availabilitySnapshot() {
    return this.floors.flatMap((floor) => floor.availability());
  }
}

module.exports = ParkingLot;
