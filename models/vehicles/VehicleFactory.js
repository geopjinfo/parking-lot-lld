const { VEHICLE_TYPE } = require('../../constants/enums');
const Motorcycle = require('./Motorcycle');
const Car = require('./Car');
const ElectricCar = require('./ElectricCar');
const Bus = require('./Bus');

/** Builds a vehicle from a type string, so callers don't import every class. */
class VehicleFactory {
  static create(type, plate, opts = {}) {
    switch (type) {
      case VEHICLE_TYPE.MOTORCYCLE:
        return new Motorcycle(plate, opts);
      case VEHICLE_TYPE.CAR:
        return new Car(plate, opts);
      case VEHICLE_TYPE.ELECTRIC:
        return new ElectricCar(plate, opts);
      case VEHICLE_TYPE.BUS:
        return new Bus(plate, opts);
      default:
        throw new Error(`Unknown vehicle type: ${type}`);
    }
  }
}

module.exports = VehicleFactory;
