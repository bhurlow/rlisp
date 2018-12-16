
class Numeric {

  constructor(number) {
    this.number = number
    this._type = 'Number'
  }

  pr() {
    return '*print_number*'
  }

  equals(comp) {
    this.number === comp
  }

}

module.exports = Numeric
