
class Symbolic {

  constructor(id) {
    this.id = id
    this._type = 'Symbol'
  }

  pr() {
    return '*print_number*'
  }

  toString() {
    return 'SYMBOL()'
  }

  equals(comp) {
    this.id === comp
  }

}

module.exports = Symbolic
