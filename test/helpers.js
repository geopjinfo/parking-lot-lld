const ParkingSpot = require('../models/ParkingSpot');
const ParkingFloor = require('../models/ParkingFloor');
const ParkingLot = require('../models/ParkingLot');
const PreferenceAllocator = require('../services/allocation/PreferenceAllocator');
const FlatHourlyFeeStrategy = require('../services/fee/FlatHourlyFeeStrategy');
const ParkingService = require('../services/ParkingService');
const IDGenerator = require('../utils/IDGenerator');
const { SPOT_TYPE } = require('../constants/enums');

/** Build a fresh lot + service for a test. spotSpec is [id, SPOT_TYPE] pairs. */
function buildService(spotSpec, feeStrategy = new FlatHourlyFeeStrategy()) {
  const floor = new ParkingFloor(1, spotSpec.map(([id, type]) => new ParkingSpot(id, type)));
  const lot = new ParkingLot();
  lot.addFloor(floor);

  const service = new ParkingService({
    lot,
    allocator: new PreferenceAllocator(),
    feeStrategy,
    idGenerator: new IDGenerator('T-'),
  });

  return { lot, service };
}

/** One spot of each type — handy default for allocation tests. */
const ONE_OF_EACH = [
  ['S1', SPOT_TYPE.SMALL],
  ['M1', SPOT_TYPE.MEDIUM],
  ['L1', SPOT_TYPE.LARGE],
  ['H1', SPOT_TYPE.HANDICAPPED],
  ['C1', SPOT_TYPE.CHARGING],
];

module.exports = { buildService, ONE_OF_EACH };
