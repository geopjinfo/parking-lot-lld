const Ticket = require('../models/Ticket');
const Mutex = require('../utils/Mutex');

/**
 * Entry point for check-in / check-out. Everything it needs is passed in, so
 * there's no global state. Check-in is "find a spot, then claim it", so a mutex
 * serialises it and two cars can't get the same spot; tryAssign is the backstop.
 */
class ParkingService {
  constructor({ lot, allocator, feeStrategy, idGenerator }) {
    if (!lot || !allocator || !feeStrategy || !idGenerator) {
      throw new Error('ParkingService requires lot, allocator, feeStrategy and idGenerator');
    }
    this.lot = lot;
    this.allocator = allocator;
    this.feeStrategy = feeStrategy;
    this.idGenerator = idGenerator;
    this._mutex = new Mutex();
  }

  /** Park a vehicle and return its ticket. Throws if nothing fits. */
  async checkIn(vehicle, now = Date.now()) {
    return this._mutex.runExclusive(() => {
      const spot = this.allocator.findSpot(this.lot, vehicle);
      if (!spot) {
        throw new Error(`No available spot for ${vehicle.type} (${vehicle.plate})`);
      }

      const claimed = spot.tryAssign(vehicle);
      if (!claimed) {
        // Shouldn't happen while the mutex is held, but guard anyway.
        throw new Error(`Spot ${spot.id} was taken concurrently`);
      }

      const ticket = new Ticket(this.idGenerator.next(), vehicle, spot, now);
      this.lot.addTicket(ticket);
      return ticket;
    });
  }

  /** Check a vehicle out by ticket id and return a receipt. Throws on bad id. */
  async checkOut(ticketId, now = Date.now()) {
    return this._mutex.runExclusive(() => {
      const ticket = this.lot.getTicket(ticketId);
      if (!ticket) {
        throw new Error(`Invalid ticket id: ${ticketId}`);
      }

      ticket.close(now);
      ticket.spot.release();
      this.lot.closeTicket(ticketId);

      const fee = this.feeStrategy.calculate(ticket);
      return {
        ticketId: ticket.id,
        plate: ticket.vehicle.plate,
        spotId: ticket.spot.id,
        duration: ticket.durationInHours(),
        fee,
      };
    });
  }
}

module.exports = ParkingService;
