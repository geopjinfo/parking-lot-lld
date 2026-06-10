const { test } = require('node:test');
const assert = require('node:assert/strict');

const Ticket = require('../models/Ticket');
const FlatHourlyFeeStrategy = require('../services/fee/FlatHourlyFeeStrategy');
const TieredFeeStrategy = require('../services/fee/TieredFeeStrategy');
const { VEHICLE_TYPE, VEHICLE_FEE_RATE } = require('../constants/enums');

const HOUR = 60 * 60 * 1000;

// Minimal ticket stub: only vehicle.type and duration matter to a fee strategy.
function ticketFor(type, hours) {
  const start = 0;
  const end = hours * HOUR;
  const ticket = new Ticket('T-x', { type, plate: 'P-1' }, { id: 'S1' }, start);
  ticket.close(end);
  return ticket;
}

test('flat hourly: fee = hours * rate', () => {
  const strategy = new FlatHourlyFeeStrategy();
  const fee = strategy.calculate(ticketFor(VEHICLE_TYPE.CAR, 3));
  assert.equal(fee, 3 * VEHICLE_FEE_RATE[VEHICLE_TYPE.CAR]);
});

test('flat hourly: rounds partial hours up', () => {
  const strategy = new FlatHourlyFeeStrategy();
  // 90 minutes -> 2 billable hours
  const ticket = new Ticket('T-x', { type: VEHICLE_TYPE.CAR }, { id: 'S1' }, 0);
  ticket.close(90 * 60 * 1000);
  assert.equal(strategy.calculate(ticket), 2 * VEHICLE_FEE_RATE[VEHICLE_TYPE.CAR]);
});

test('flat hourly: minimum one-hour charge for a short stay past the grace window', () => {
  const strategy = new FlatHourlyFeeStrategy();
  const ticket = new Ticket('T-x', { type: VEHICLE_TYPE.ELECTRIC }, { id: 'S1' }, 0);
  ticket.close(20 * 60 * 1000); // 20 min: past the 15-min grace, under an hour
  assert.equal(strategy.calculate(ticket), VEHICLE_FEE_RATE[VEHICLE_TYPE.ELECTRIC]);
});

test('flat hourly: a stay within the grace window is free', () => {
  const strategy = new FlatHourlyFeeStrategy(); // default 15-min grace
  const ticket = new Ticket('T-x', { type: VEHICLE_TYPE.CAR }, { id: 'S1' }, 0);
  ticket.close(10 * 60 * 1000); // 10 min: entered and left without really parking
  assert.equal(strategy.calculate(ticket), 0);
});

test('flat hourly: grace window is configurable', () => {
  const strategy = new FlatHourlyFeeStrategy(VEHICLE_FEE_RATE, { graceMinutes: 0 });
  const ticket = new Ticket('T-x', { type: VEHICLE_TYPE.CAR }, { id: 'S1' }, 0);
  ticket.close(5 * 60 * 1000); // 5 min, but no grace -> minimum one hour
  assert.equal(strategy.calculate(ticket), VEHICLE_FEE_RATE[VEHICLE_TYPE.CAR]);
});

test('tiered: a stay within the grace window is free', () => {
  const strategy = new TieredFeeStrategy(VEHICLE_FEE_RATE, { freeHours: 0, dailyCapHours: 24 });
  const ticket = new Ticket('T-x', { type: VEHICLE_TYPE.CAR }, { id: 'S1' }, 0);
  ticket.close(10 * 60 * 1000); // 10 min
  assert.equal(strategy.calculate(ticket), 0);
});

test('flat hourly: unknown vehicle type throws', () => {
  const strategy = new FlatHourlyFeeStrategy();
  assert.throws(() => strategy.calculate(ticketFor('SPACESHIP', 1)), /Unknown vehicle type/);
});

test('each vehicle type uses its own rate', () => {
  const strategy = new FlatHourlyFeeStrategy();
  for (const type of Object.values(VEHICLE_TYPE)) {
    assert.equal(strategy.calculate(ticketFor(type, 1)), VEHICLE_FEE_RATE[type]);
  }
});

test('tiered: first free hour is not charged', () => {
  const strategy = new TieredFeeStrategy(VEHICLE_FEE_RATE, { freeHours: 1, dailyCapHours: 12 });
  // 1 hour parked -> 0 billable
  assert.equal(strategy.calculate(ticketFor(VEHICLE_TYPE.CAR, 1)), 0);
  // 3 hours parked -> 2 billable
  assert.equal(strategy.calculate(ticketFor(VEHICLE_TYPE.CAR, 3)), 2 * VEHICLE_FEE_RATE[VEHICLE_TYPE.CAR]);
});

test('tiered: charge is capped per day', () => {
  const rate = VEHICLE_FEE_RATE[VEHICLE_TYPE.CAR];
  const strategy = new TieredFeeStrategy(VEHICLE_FEE_RATE, { freeHours: 0, dailyCapHours: 12 });
  // 20 billable hours, capped at 12 * rate
  assert.equal(strategy.calculate(ticketFor(VEHICLE_TYPE.CAR, 20)), 12 * rate);
});

test('tiered with no free hours and 24h cap equals flat hourly', () => {
  const flat = new FlatHourlyFeeStrategy();
  const tiered = new TieredFeeStrategy(VEHICLE_FEE_RATE, { freeHours: 0, dailyCapHours: 24 });
  const ticket = ticketFor(VEHICLE_TYPE.BUS, 5);
  assert.equal(tiered.calculate(ticket), flat.calculate(ticket));
});
