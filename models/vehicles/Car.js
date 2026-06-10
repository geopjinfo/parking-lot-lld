const Vehicle = require('./Vehicle');
const { VEHICLE_TYPE } = require('../../constants/enums');

/**
 * The optional type lets ElectricCar pass its own type up instead of
 * overwriting this.type after super().
 */
class Car extends Vehicle {
  constructor(plate, opts = {}, type = VEHICLE_TYPE.CAR) {
    super(plate, type, opts);
  }
}

module.exports = Car;
