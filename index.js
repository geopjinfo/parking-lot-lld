/**
 * Wires everything together and runs a small demo. This is the only place that
 * builds objects; nothing else keeps global state.
 */
const ParkingSpot = require('./models/ParkingSpot');
const ParkingFloor = require('./models/ParkingFloor');
const ParkingLot = require('./models/ParkingLot');
const VehicleFactory = require('./models/vehicles/VehicleFactory');
const PreferenceAllocator = require('./services/allocation/PreferenceAllocator');
const FlatHourlyFeeStrategy = require('./services/fee/FlatHourlyFeeStrategy');
const ParkingService = require('./services/ParkingService');
const IDGenerator = require('./utils/IDGenerator');
const { SPOT_TYPE, VEHICLE_TYPE } = require('./constants/enums');

// Build the lot.
const floor1 = new ParkingFloor(1, [
  new ParkingSpot('S1', SPOT_TYPE.SMALL),
  new ParkingSpot('M1', SPOT_TYPE.MEDIUM),
  new ParkingSpot('L1', SPOT_TYPE.LARGE),
  new ParkingSpot('H1', SPOT_TYPE.HANDICAPPED),
  new ParkingSpot('C1', SPOT_TYPE.CHARGING),
]);

const lot = new ParkingLot();
lot.addFloor(floor1);

// Log availability as it changes.
lot.on('availabilityChanged', ({ floor, type, available, total }) => {
  console.log(`   📡 [live] Floor ${floor} ${type}: ${available}/${total} free`);
});

// Hand the service everything it needs.
const service = new ParkingService({
  lot,
  allocator: new PreferenceAllocator(),
  feeStrategy: new FlatHourlyFeeStrategy(),
  idGenerator: new IDGenerator('T-'),
});

async function main() {
  const disabledCar = VehicleFactory.create(VEHICLE_TYPE.CAR, 'D-1234', { isDisabled: true });
  const electricCar = VehicleFactory.create(VEHICLE_TYPE.ELECTRIC, 'E-5678');

  // Pretend they arrived two hours ago so the fee isn't zero.
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;

  const ticket1 = await service.checkIn(disabledCar, twoHoursAgo);
  console.log(`✅ Disabled Car checked in. Spot: ${ticket1.spot.id}, Ticket: ${ticket1.id}`);

  const ticket2 = await service.checkIn(electricCar, twoHoursAgo);
  console.log(`⚡ Electric Car checked in. Spot: ${ticket2.spot.id}, Ticket: ${ticket2.id}`);

  const r1 = await service.checkOut(ticket1.id);
  console.log(`🅿️  Disabled Car checked out. Fee: ₹${r1.fee}, Duration: ${r1.duration}hr`);

  const r2 = await service.checkOut(ticket2.id);
  console.log(`🔌 Electric Car checked out. Fee: ₹${r2.fee}, Duration: ${r2.duration}hr`);

  console.log('\nFinal availability:', lot.availabilitySnapshot());
}

main().catch((err) => {
  console.error('Demo failed:', err.message);
  process.exitCode = 1;
});
