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

function isQuoted(data) {
  return isList(data) && data.first() === 'QUOTE'
}

function isString(data) {
  return typeof data === 'string'
}

function getType(data) {
  if (isNumber(data)) return 'Number'
  if (isList(data)) return 'List'
  if (isBool(data)) return 'Boolean'
  if (isString(data)) return 'String'
  else return 'N/A'
}

module.exports = {
  getType,
  isArray,
  isDigit,
  isList,
  isNumber,
  isQuoted,
  isString,
  isWhitespace
}
