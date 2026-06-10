const Car = require('./Car');
const { VEHICLE_TYPE } = require('../../constants/enums');

/** A Car that reports type ELECTRIC and always wants a charging spot. */
class ElectricCar extends Car {
  constructor(plate, opts = {}) {
    super(plate, { ...opts, needsCharging: true }, VEHICLE_TYPE.ELECTRIC);
  }
}

module.exports = ElectricCar;
