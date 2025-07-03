const  Car  = require('./models/vehicles/Car');
const ElectricCar = require('./models/vehicles/ElectricCar');
const ParkingSpot = require('./models/ParkingSpot');
const ParkingFloor = require('./models/ParkingFloor');
const ParkingLot = require('./models/ParkingLot');
const ParkingService = require('./services/ParkingService');
const { SPOT_TYPE } = require('./constants/enums');

// Setup: Create parking floor with multiple spot types
const floor1 = new ParkingFloor(1, [
  new ParkingSpot('S1', SPOT_TYPE.SMALL),
  new ParkingSpot('M1', SPOT_TYPE.MEDIUM),
  new ParkingSpot('L1', SPOT_TYPE.LARGE),
  new ParkingSpot('H1', SPOT_TYPE.HANDICAPPED),
  new ParkingSpot('C1', SPOT_TYPE.CHARGING),
]);

ParkingLot.addFloor(floor1);

// Create vehicles
const disabledCar = new Car('D-1234', true);
const electricCar = new ElectricCar('E-5678');

// Check-In
const ticket1 = ParkingService.checkIn(disabledCar);
console.log(`✅ Disabled Car checked in. Spot: ${ticket1.spot.id}, Ticket: ${ticket1.id}`);

const ticket2 = ParkingService.checkIn(electricCar);
console.log(`⚡ Electric Car checked in. Spot: ${ticket2.spot.id}, Ticket: ${ticket2.id}`);

// Wait a bit before checkout
setTimeout(() => {
  const result1 = ParkingService.checkOut(ticket1.id);
  console.log(`🅿️ Disabled Car checked out. Fee: ₹${result1.fee}, Duration: ${result1.duration}hr`);

  const result2 = ParkingService.checkOut(ticket2.id);
  console.log(`🔌 Electric Car checked out. Fee: ₹${result2.fee}, Duration: ${result2.duration}hr`);
}, 2000); // Simulate 2s stay (rounded to 1 hour)
