/**
 * Turns a closed ticket into a price. Swap the one injected into ParkingService
 * to change how parking is charged.
 */
class FeeStrategy {
  /** Fee for a closed ticket. */
  calculate(ticket) {
    throw new Error('FeeStrategy.calculate must be implemented by a subclass');
  }
}

module.exports = FeeStrategy;
