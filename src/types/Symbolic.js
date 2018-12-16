
class Symbolic {

  constructor(id) {
    this.id = id
    this._type = 'Symbol'
  }

  pr() {
    return '*print_number*'
  }

  toString() {
    return this.id
  }

  equals(comp) {
    this.id === comp
  }

}

module.exports = Symbolic
