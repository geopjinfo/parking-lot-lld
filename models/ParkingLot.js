class ParkingLot {
  constructor() {
    this.floors = [];
    this.activeTickets = new Map(); // Map<ticketId, Ticket>
  }

  addFloor(floor) {
    this.floors.push(floor);
  }

  findSpot(vehicle) {
    for (const floor of this.floors) {
      const spot = floor.findAvailableSpot(vehicle);
      if (spot) return spot;
    }
    return null;
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

  listAvailability() {
    return this.floors.map((floor, index) => ({
      floor: index + 1,
      availableSpots: floor.spots.filter(s => !s.occupied).length,
      totalSpots: floor.spots.length,
    }));
  }
}

module.exports = new ParkingLot(); // Singleton
