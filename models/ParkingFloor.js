/**
 * Just holds spots. Keeps a free-list per spot type (updated from spot events)
 * so finding a free spot is a quick lookup, not a scan. It doesn't decide which
 * spot a vehicle gets — that's the allocator's job.
 */
class ParkingFloor {
  constructor(floorNumber, spots = []) {
    this.floorNumber = floorNumber;
    this.spots = spots;
    this._freeByType = new Map();
    this._totalByType = new Map();

    for (const spot of spots) {
      this._totalByType.set(spot.type, (this._totalByType.get(spot.type) || 0) + 1);
      this._addFree(spot);
      // Keep the free-list in sync as spots fill and empty.
      spot.on('assigned', () => this._removeFree(spot));
      spot.on('released', () => this._addFree(spot));
    }
  }

  _addFree(spot) {
    if (!this._freeByType.has(spot.type)) this._freeByType.set(spot.type, new Set());
    this._freeByType.get(spot.type).add(spot);
  }

  _removeFree(spot) {
    const set = this._freeByType.get(spot.type);
    if (set) set.delete(spot);
  }

  /** Any free spot of this type, or null. */
  getAvailableSpot(type) {
    const set = this._freeByType.get(type);
    if (!set || set.size === 0) return null;
    return set.values().next().value;
  }

  countAvailable(type) {
    const set = this._freeByType.get(type);
    return set ? set.size : 0;
  }

  countTotal(type) {
    return this._totalByType.get(type) || 0;
  }

  /** How many free vs total, per spot type, on this floor. */
  availability() {
    const rows = [];
    for (const type of this._totalByType.keys()) {
      rows.push({
        floor: this.floorNumber,
        type,
        available: this.countAvailable(type),
        total: this.countTotal(type),
      });
    }
    return rows;
  }
}

module.exports = ParkingFloor;
