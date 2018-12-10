/*
 * evaluates forms read by reader
 * if Sexp (Array), apply operand 
 * to rest of sexp recursively
 */

const R = require('ramda')
const { readString } = require('./reader')

const { 
  isNumber, 
  isList, 
  getType,
  isQuoted,
} = require('./type')

const { List } = require('./immutable.js')

// native function implementations

function nativeAdd(...args) {
  return R.sum(args)
}

function nativeSubtract(...args) {
  return args.reduce(R.subtract)
}

function nativeEquals(...args) {
  if (args.length > 2) {
    throw new Error('comparison arity > 2 not implemented')
  }

  let [a, b] = args

  let aType = getType(a)
  let bType = getType(b)

  if (aType != bType) {
    throw new Error('cant compare distinct types')
  }

  // native types can use native compare
  if ('Number' === aType || 'Boolean' === aType) {
    return a === b
  }

  // otherwise defer to type equality method
  return a.equals(b)
}

// TODO assert listlike
function nativeFirst(data) {
  return data.first()
}

// TODO assert listlike
function nativeRest(data) {
  return data.shift()
}

const tokenToNative = {
  '+': nativeAdd,
  '-': nativeSubtract,
  '=': nativeEquals,
  'first': nativeFirst,
  'rest': nativeRest
}

function unquote(data) {
  if (isQuoted(data)) {
    return data.get(1)
  }
  return data
}

function evalSexp(list) {
  let operand = list.first()

  let rest = list.shift()

  let args = rest.map(evalForm)

  let nativeFn = tokenToNative[operand]

  // TODO
  // lookup fns in env

  let ret = nativeFn(...args)

  return ret
}

function evalForm(form) {
  // form = unquote(form)
  if (isQuoted(form)) {
    return unquote(form)
  }
  if (isList(form)) {
    return evalSexp(form)
  }
  if (isNumber(form)) {
    return form
  }
}

module.exports = {
  evalForm
}
