const Vehicle = require('./Vehicle');
const { VEHICLE_TYPE } = require('../../constants/enums');

class Bus extends Vehicle {
  constructor(plate, opts = {}) {
    super(plate, VEHICLE_TYPE.BUS, opts);
  }
}

module.exports = Bus;
