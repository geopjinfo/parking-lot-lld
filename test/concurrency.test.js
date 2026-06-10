const { test } = require('node:test');
const assert = require('node:assert/strict');

const VehicleFactory = require('../models/vehicles/VehicleFactory');
const ParkingSpot = require('../models/ParkingSpot');
const { VEHICLE_TYPE, SPOT_TYPE } = require('../constants/enums');
const { buildService } = require('./helpers');

test('N concurrent check-ins for 1 spot: exactly one wins', async () => {
  // A single MEDIUM spot, 10 cars racing for it.
  const { lot, service } = buildService([['M1', SPOT_TYPE.MEDIUM]]);

  const attempts = Array.from({ length: 10 }, (_, i) =>
    service.checkIn(VehicleFactory.create(VEHICLE_TYPE.CAR, `C-${i}`))
  );
  const results = await Promise.allSettled(attempts);

  const wins = results.filter((r) => r.status === 'fulfilled');
  const losses = results.filter((r) => r.status === 'rejected');

  assert.equal(wins.length, 1, 'exactly one check-in should succeed');
  assert.equal(losses.length, 9, 'the rest should fail gracefully');
  assert.equal(lot.availabilitySnapshot()[0].available, 0, 'spot is occupied');
});

test('a spot freed on check-out can be reused', async () => {
  const { service } = buildService([['M1', SPOT_TYPE.MEDIUM]]);

  const first = await service.checkIn(VehicleFactory.create(VEHICLE_TYPE.CAR, 'C-1'));
  await assert.rejects(
    () => service.checkIn(VehicleFactory.create(VEHICLE_TYPE.CAR, 'C-2')),
    /No available spot/
  );

  await service.checkOut(first.id);

  const second = await service.checkIn(VehicleFactory.create(VEHICLE_TYPE.CAR, 'C-3'));
  assert.equal(second.spot.id, 'M1');
});

test('tryAssign is atomic: a second claim on the same spot fails', () => {
  const spot = new ParkingSpot('M1', SPOT_TYPE.MEDIUM);
  const a = VehicleFactory.create(VEHICLE_TYPE.CAR, 'A');
  const b = VehicleFactory.create(VEHICLE_TYPE.CAR, 'B');

  assert.equal(spot.tryAssign(a), true);
  assert.equal(spot.tryAssign(b), false);
  assert.equal(spot.vehicle, a);
});
