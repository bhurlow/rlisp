const { List } = require('../immutable')

List.prototype.pr = function() {
  return 'TODO'
}

List.prototype._type = 'List'

List.prototype.toString = function() {
  return 'LIST()'
}

module.exports = List
