class Vehicle {
  constructor(plate, type, isDisabled = false) {
    this.plate = plate;
    this.type = type;
    this.isDisabled = isDisabled;
  }
}

module.exports = Vehicle;
