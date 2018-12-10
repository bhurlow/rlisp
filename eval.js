/*
 * evaluates forms read by reader
 * if Sexp (Array), apply operand 
 * to rest of sexp recursively
 */

const R = require('ramda')
const { readString } = require('./reader')
const { isArray, isNumber } = require('./type')
const { List } = require('./immutable.js')

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

function evalSexp(list) {
  let operand = list.first()

  let args = list.shift().map(evalForm)

  let nativeFn = tokenToNative[operand]

  // TODO
  // lookup fns in env

  let ret = nativeFn(...args)

  return ret
}

function evalForm(form) {
  if (List.isList(form)) {
    return evalSexp(form)
  }
  if (isNumber(form)) {
    return form
  }
}

module.exports = {
  evalForm
}

// const example = '(- (- 6 6) 6)'
// let res = readString(example)
// let evalRes = evalForm(res)
// console.log(evalRes)
