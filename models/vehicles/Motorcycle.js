const Vehicle = require('./Vehicle');
const { VEHICLE_TYPE } = require('../../constants/enums');

class Motorcycle extends Vehicle {
  constructor(plate, opts = {}) {
    super(plate, VEHICLE_TYPE.MOTORCYCLE, opts);
  }
}

module.exports = Motorcycle;
