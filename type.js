const { List } = require('./immutable.js')

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

function isBool(data) {
  return typeof data === 'boolean'
}

function isArray(data) {
  return Array.isArray(data)
}

function isList(data) {
  return List.isList(data)
}

function getType(data) {
  if (isNumber(data)) return 'Number'
  if (isList(data)) return 'List'
  if (isBool(data)) return 'Boolean'
  else return 'N/A'
}

module.exports = {
  isWhitespace,
  isDigit,
  isArray,
  isNumber,
  isList,
  getType
}
