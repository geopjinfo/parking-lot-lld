/**
 * Decides which free spot a vehicle gets. Swap this out to change the
 * allocation rule without touching the lot or the service.
 */
class SpotAllocator {
  /** Return a free spot for the vehicle, or null if none fits. */
  findSpot(lot, vehicle) {
    throw new Error('SpotAllocator.findSpot must be implemented by a subclass');
  }
}

module.exports = SpotAllocator;
