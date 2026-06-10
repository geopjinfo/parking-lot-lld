/**
 * Simple async lock. Lets only one task run a critical section at a time,
 * so two check-ins can't grab the same spot.
 */
class Mutex {
  constructor() {
    this._locked = false;
    this._waiters = [];
  }

  /** Wait for the lock. Resolves with a release function. */
  acquire() {
    return new Promise((resolve) => {
      if (!this._locked) {
        this._locked = true;
        resolve(() => this._release());
      } else {
        this._waiters.push(resolve);
      }
    });
  }

  _release() {
    const next = this._waiters.shift();
    if (next) {
      // Pass the lock straight to whoever's next in line.
      next(() => this._release());
    } else {
      this._locked = false;
    }
  }

  /** Run fn with the lock held, and always release it afterwards. */
  async runExclusive(fn) {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }
}

module.exports = Mutex;
