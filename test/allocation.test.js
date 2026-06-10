const { test } = require('node:test');
const assert = require('node:assert/strict');

const VehicleFactory = require('../models/vehicles/VehicleFactory');
const { VEHICLE_TYPE, SPOT_TYPE } = require('../constants/enums');
const { buildService, ONE_OF_EACH } = require('./helpers');

test('motorcycle takes the SMALL spot first', async () => {
  const { service } = buildService(ONE_OF_EACH);
  const ticket = await service.checkIn(VehicleFactory.create(VEHICLE_TYPE.MOTORCYCLE, 'M-1'));
  assert.equal(ticket.spot.type, SPOT_TYPE.SMALL);
});

test('car takes a MEDIUM spot', async () => {
  const { service } = buildService(ONE_OF_EACH);
  const ticket = await service.checkIn(VehicleFactory.create(VEHICLE_TYPE.CAR, 'C-1'));
  assert.equal(ticket.spot.type, SPOT_TYPE.MEDIUM);
});

test('bus requires a LARGE spot', async () => {
  const { service } = buildService(ONE_OF_EACH);
  const ticket = await service.checkIn(VehicleFactory.create(VEHICLE_TYPE.BUS, 'B-1'));
  assert.equal(ticket.spot.type, SPOT_TYPE.LARGE);
});

test('disabled driver is prioritised to a HANDICAPPED spot', async () => {
  const { service } = buildService(ONE_OF_EACH);
  const ticket = await service.checkIn(
    VehicleFactory.create(VEHICLE_TYPE.CAR, 'C-2', { isDisabled: true })
  );
  assert.equal(ticket.spot.type, SPOT_TYPE.HANDICAPPED);
});

test('electric car is prioritised to a CHARGING spot', async () => {
  const { service } = buildService(ONE_OF_EACH);
  const ticket = await service.checkIn(VehicleFactory.create(VEHICLE_TYPE.ELECTRIC, 'E-1'));
  assert.equal(ticket.spot.type, SPOT_TYPE.CHARGING);
});

test('disabled electric car prefers HANDICAPPED over CHARGING', async () => {
  const { service } = buildService(ONE_OF_EACH);
  const ticket = await service.checkIn(
    VehicleFactory.create(VEHICLE_TYPE.ELECTRIC, 'E-2', { isDisabled: true })
  );
  assert.equal(ticket.spot.type, SPOT_TYPE.HANDICAPPED);
});

test('falls back to a larger spot when preferred size is full', async () => {
  // Only a LARGE spot exists; a car (prefers MEDIUM) should still fit.
  const { service } = buildService([['L1', SPOT_TYPE.LARGE]]);
  const ticket = await service.checkIn(VehicleFactory.create(VEHICLE_TYPE.CAR, 'C-3'));
  assert.equal(ticket.spot.type, SPOT_TYPE.LARGE);
});

test('throws when no spot fits', async () => {
  const { service } = buildService([['S1', SPOT_TYPE.SMALL]]);
  await assert.rejects(
    () => service.checkIn(VehicleFactory.create(VEHICLE_TYPE.BUS, 'B-2')),
    /No available spot/
  );
});

test('availability updates as spots fill and empty', async () => {
  const { lot, service } = buildService(ONE_OF_EACH);
  assert.equal(lot.availabilitySnapshot().find((r) => r.type === SPOT_TYPE.MEDIUM).available, 1);

  const ticket = await service.checkIn(VehicleFactory.create(VEHICLE_TYPE.CAR, 'C-4'));
  assert.equal(lot.availabilitySnapshot().find((r) => r.type === SPOT_TYPE.MEDIUM).available, 0);

  await service.checkOut(ticket.id);
  assert.equal(lot.availabilitySnapshot().find((r) => r.type === SPOT_TYPE.MEDIUM).available, 1);
});
