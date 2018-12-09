const R = require('ramda')
const { readString } = require('./reader')
const { isArray, isNumber } = require('./type')

function nativeAdd(...args) {
  return R.sum(args)
}

function nativeSubtract(...args) {
  return args.reduce(R.subtract)
}

const tokenToNative = {
  '+': nativeAdd,
  '-': nativeSubtract
}

function evalSexp(form) {
  let operand = R.head(form)

  let evalAll = R.map(evalForm)

  let args = evalAll(R.tail(form))

  let nativeFn = tokenToNative[operand]

  let ret = nativeFn(...args)

  // TODO
  // lookup fns in env

  return ret
}

function evalForm(form) {
  if (isArray(form)) {
    return evalSexp(form)
  }

  if (isNumber(form)) {
    return form
  }
}

const example = '(- (- 6 6) 6)'
let res = readString(example)
let evalRes = evalForm(res)
console.log(evalRes)
