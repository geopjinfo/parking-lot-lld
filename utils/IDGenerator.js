let counter = 1;

function generateId() {
  return `T-${counter++}`;
}

module.exports = generateId;
