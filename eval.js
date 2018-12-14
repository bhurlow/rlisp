/*
 * evaluates forms read by reader
 * if Sexp (Array), apply operand 
 * to rest of sexp recursively
 */

const R = require('ramda')
const { readString } = require('./reader')

const { isNumber, isList, getType, isQuoted, isString } = require('./type')

const { List, Map } = require('./immutable.js')

function withEnv(env, data) {
  return { env, data }
}

// native function implementations

function nativeAdd(...args) {
  return R.sum(args)
}

function nativeSubtract(...args) {
  return args.reduce(R.subtract)
}

function nativeMult(...args) {
  return args.reduce(R.multiply)
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

function putln(...args) {
  const strs = args.map(String)
  process.stdout.write(...strs)
  process.stdout.write('\n')
  return '<wrote bytes>'
}

function fn(...args) {}

const tokenToNative = {
  '+': nativeAdd,
  '-': nativeSubtract,
  '=': nativeEquals,
  '*': nativeMult,
  first: nativeFirst,
  rest: nativeRest,
  putln: putln,
  fn: fn
}

function unquote(env, data) {
  if (isQuoted(data)) {
    return withEnv(env, data.get(1))
  }
  return withEnv(env, data)
}

function evalSexp(env, list) {
  let operand = list.first()
  let rest = list.shift()
  let args = rest.map(x => _evalForm(env, x).data)

  if (!isList(operand)) {
    let found = env.get(operand)

    if (!found) {
      throw new Error(`Unknown Operator: ${operand}`)
    }

    let data = found(...args)
    return { env, data }
  }

  if (isList(operand)) {
    if ('fn' === operand.get(0)) {
      // separate out the fns pargs
      let fnList = operand
      let fnArgs = operand.get(1)
      let fnBody = operand.get(2)

      // evaluate the arg spec, in case we want
      // to dynamically create args
      let argSpec = _evalForm(env, fnList.get(1)).data

      if (rest.count() !== argSpec.count()) {
        throw new Error('invalid arity')
      }

      // bind function args
      let bindingEnv = env

      argSpec.forEach((arg, idx) => {
        let bindVar = arg
        let bindVal = rest.get(idx)
        console.log(bindVar, bindVal)
        bindingEnv = bindingEnv.set(bindVar, bindVal)
      })

      // TODO
      // implicit block here
      let { data } = _evalForm(bindingEnv, fnBody)

      // here we map the binding vars in argspec
      // to their inputs applied, then eval the
      // function body inside that env
      return { env, data }
    }
  }
}

function initEnv() {
  let env = new Map()
  Object.entries(tokenToNative).map(([k, v]) => {
    env = env.set(k, v)
  })
  return env
}

function _evalForm(env, form) {
  if (isQuoted(form)) {
    return unquote(env, form)
  }
  if (isList(form)) {
    return evalSexp(env, form)
  }
  if (isNumber(form)) {
    return withEnv(env, form)
  }
  if (isString(form)) {
    let lookup = env.get(form)
    return withEnv(env, lookup)
  }
}

function evalForm(form) {
  let res = _evalForm(initEnv(), form)
  return res.data
}

module.exports = {
  evalForm
}
