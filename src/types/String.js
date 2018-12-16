const { List } = require('../immutable')

// model immutable string using List class
class String {
  constructor(initStr) {
    this.chars = new List(initStr.split(''))
  }

  pr() {
    return 'TODO'
  }

  equals(comp) {}
}

module.exports = String
