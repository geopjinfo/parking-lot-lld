const Car = require('./Car');
const { VEHICLE_TYPE } = require('../../constants/enums');

class ElectricCar extends Car {
  constructor(plate, isDisabled = false) {
    super(plate, isDisabled);
    this.type = VEHICLE_TYPE.ELECTRIC;
    this.needsCharging = true;
  }
}

module.exports = ElectricCar;
