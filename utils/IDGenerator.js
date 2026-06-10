/** Hands out sequential ids like T-1, T-2. Each instance keeps its own count. */
class IDGenerator {
  constructor(prefix = 'T-') {
    this.prefix = prefix;
    this.counter = 0;
  }

  next() {
    return `${this.prefix}${++this.counter}`;
  }
}

module.exports = IDGenerator;
