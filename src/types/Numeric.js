
class Numeric {

  constructor(number) {
    this.number = number
    this._type = 'Number'
  }

  pr() {
    return '*print_number*'
  }

  toString() {
    return String(this.number)
  }

  equals(comp) {
    this.number === comp
  }

}

module.exports = Numeric
