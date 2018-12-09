function isWhitespace(ch) {
  return ch === ' '
}

function isDigit(ch) {
  // TODO
  // replace with regex test
  return Boolean(parseInt(ch))
}

function isNumber(data) {
  return typeof data === 'number'
}

function isArray(data) {
  return Array.isArray(data)
}

module.exports = {
  isWhitespace,
  isDigit,
  isArray,
  isNumber
}
