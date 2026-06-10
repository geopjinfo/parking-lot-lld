const { VEHICLE_TYPE } = require('../../constants/enums');

/**
 * Base class for anything that parks. type sets the size/fee; the two flags
 * tell the allocator to prefer handicapped/charging spots.
 */
class Vehicle {
  constructor(plate, type, { isDisabled = false, needsCharging = false } = {}) {
    if (!plate) throw new Error('Vehicle requires a plate');
    if (!Object.values(VEHICLE_TYPE).includes(type)) {
      throw new Error(`Invalid vehicle type: ${type}`);
    }
    this.plate = plate;
    this.type = type;
    this.isDisabled = isDisabled;
    this.needsCharging = needsCharging;
  }
}

module.exports = Vehicle;
