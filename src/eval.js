/*
 * evaluates forms read by reader
 * if Sexp (Array), apply operand 
 * to rest of sexp recursively
 */

const R = require('ramda')
const { readString } = require('./reader')

const { isNumber, isList, getType, isQuoted, isString } = require('./type')

const { Map } = require('./immutable.js')

// our data types
const { List, Numeric } = require('./types')

function withEnv(env, data) {
  return { env, data }
}

// native function implementations

function nativeAdd(env, ...args) {
  let res = R.sum(args.map(x => x.number))
  return withEnv(env, new Numeric(res))
}

function nativeSubtract(env, ...args) {
  let res = args.map(x => x.number).reduce(R.subtract)
  return withEnv(env, new Numeric(res))
}

function nativeMult(env, ...args) {
  let res = args.map(x => x.number).reduce(R.multiply)
  return withEnv(env, new Numeric(res))
}

function nativeEquals(env, ...args) {
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
  return withEnv(env, a.equals(b))
}

// TODO assert listlike
function nativeFirst(env, data) {
  return withEnv(env, data.first())
}

// TODO assert listlike
function nativeRest(env, data) {
  return withEnv(env, data.shift())
}

function putln(env, ...args) {
  const strs = args.map(String)
  process.stdout.write(...strs)
  process.stdout.write('\n')
  return withEnv(env, '<wrote bytes>')
}

function def(env, ...args) {
  let [sym, value] = args
  let newEnv = env.set(sym.id, value)
  return withEnv(newEnv, true)
}

const tokenToNative = {
  '+': nativeAdd,
  '-': nativeSubtract,
  '=': nativeEquals,
  '*': nativeMult,
  first: nativeFirst,
  rest: nativeRest,
  putln: putln,
  def
}

function unquote(env, data) {
  if (isQuoted(data)) {
    return withEnv(env, data.get(1))
  }
  return withEnv(env, data)
}

function evalSexp(env, list) {
  let operand = list.first()
  let _type = operand._type

  let rest = list.shift()
  let args = rest.map(x => _evalForm(env, x).data)

  if ('Symbol' === _type) {
    let found = env.get(operand.id)

    if (!found) {
      throw new Error(`Unknown Operator: ${operand}`)
    }

    return found(env, ...args)
  }

  if (isList(operand)) {
    // TODO
    // move this out of evalSexp into handler for 'fn' token
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
  let _type = form._type

  console.log('eval form', form)

  if (isQuoted(form)) {
    return unquote(env, form)
  }
  if ('List' === _type) {
    return evalSexp(env, form)
  }
  if ('Number' === _type) {
    return withEnv(env, form)
  }
  if ('Symbol' === _type) {
    let lookup = env.get(form.id)
    return withEnv(env, lookup)
  }
}

function evalForm(form) {
  let res = _evalForm(initEnv(), form)
  return res.data
}

function evalForms(forms) {
  let _env = initEnv()
  return forms.map(form => {
    let { env, data } = _evalForm(_env, form)
    _env = env
    return data
  })
}

module.exports = {
  evalForm,
  evalForms
}
