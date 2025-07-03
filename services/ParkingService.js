const ParkingLot = require('../models/ParkingLot');
const Ticket = require('../models/Ticket');
const FeeStrategy = require('./FeeStrategy');
const generateId = require('../utils/IDGenerator');

class ParkingService {
  checkIn(vehicle) {
    const spot = ParkingLot.findSpot(vehicle);
    if (!spot) {
      throw new Error('No available spot for this vehicle type or requirement.');
    }

    spot.assignVehicle(vehicle);

    const ticket = new Ticket(generateId(), vehicle, spot, Date.now());
    ParkingLot.addTicket(ticket);

    return ticket;
  }

  checkOut(ticketId) {
    const ticket = ParkingLot.getTicket(ticketId);
    if (!ticket) {
      throw new Error('Invalid ticket ID.');
    }

    ticket.close(Date.now());
    ticket.spot.removeVehicle();

    ParkingLot.closeTicket(ticketId);

    const hours = ticket.durationInHours();
    const fee = FeeStrategy.calculate(ticket.vehicle.type, hours);

    return {
      plate: ticket.vehicle.plate,
      duration: hours,
      fee,
      spotId: ticket.spot.id,
    };
  }
}

module.exports = new ParkingService();
