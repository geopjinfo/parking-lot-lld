const Vehicle = require('./Vehicle');
const { VEHICLE_TYPE } = require('../../constants/enums');

class Car extends Vehicle {
  constructor(plate, isDisabled = false) {
    super(plate, VEHICLE_TYPE.CAR, isDisabled);
  }
}

module.exports = Car;
