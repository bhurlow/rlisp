
class Lambda {

  constructor(closureRef) {
    this.closure = closureRef
    this._type = 'Lambda'
  }

  toString() {
    return '(lambdafn)'
  }

  invoke(args) {
    return this.closure(args)
  }

}

module.exports = Lambda
