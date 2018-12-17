/*
 * evaluates forms read by reader
 * if Sexp (Array), apply operand 
 * to rest of sexp recursively
 */

const R = require('ramda')
const { readString } = require('./reader')

const { isNumber, getType, isQuoted, isString } = require('./type')

const { Map } = require('./immutable.js')

// our data types
const { List, Numeric, Lambda } = require('./types')

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
  const strs = args.map(x => x.toString())
  process.stdout.write(...strs)
  process.stdout.write('\n')
  return withEnv(env, '<wrote bytes>')
}

function def(env, ...args) {
  let [sym, value] = args
  let newEnv = env.set(sym.id, value)
  // TODO
  // def should return a variable of some kind
  return withEnv(newEnv, true)
}

const tokenToNative = {
  '+': nativeAdd,
  '-': nativeSubtract,
  '=': nativeEquals,
  '*': nativeMult,
  first: nativeFirst,
  rest: nativeRest,
  putln,
  def
}

function unquote(env, data) {
  if (isQuoted(data)) {
    return withEnv(env, data.get(1))
  }
  return withEnv(env, data)
}

// special fn to evaluate a lambda expression into
// a closure. We return a Lambda type in case we want to
// print it, or refer to it in the environment
function evalLambda(env, list) {
  let fnArgs = list.get(1)
  let fnBody = list.get(2)

  // evaluate the arg spec, in case we want
  // to dynamically create args (unlikely)
  let argSpec = _evalForm(env, list.get(1)).data

  // return a closure with the arg specification
  // bound in when applied to args
  let closure = function(args) {
    // bind function args
    let bindingEnv = env

    argSpec.forEach((arg, idx) => {
      let bindVar = arg
      let bindVal = args.get(idx)
      bindingEnv = bindingEnv.set(bindVar.id, bindVal)
    })

    let { data } = _evalForm(bindingEnv, fnBody)

    return data
  }

  let lambda = new Lambda(closure)

  return { env, data: lambda }
}

function evalSexp(env, list) {
  let operator = list.first()
  let _type = operator._type
  let rest = list.shift()

  if ('Symbol' === _type) {
    let args = rest.map(x => {
      let { data } = _evalForm(env, x)
      return data
    })

    let found = env.get(operator.id)

    if (!found) {
      throw new Error(`Unknown Operator: ${operator}`)
    }

    if ('Lambda' === found._type) {
      let data = found.invoke(args)
      return { env, data }
    }

    return found(env, ...args)
  }

  // if operator in sexp is a list
  // normally a lambda
  // ((fn '(x) ...k) )
  if ('List' === _type) {
    let lambdaEvalRes = _evalForm(env, operator)
    let lambda = lambdaEvalRes.data
    let data = lambda.invoke(rest)
    return { env, data }
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

  if (isQuoted(form)) {
    return unquote(env, form)
  }
  if ('List' === _type) {
    if ('fn' === form.first().id) {
      return evalLambda(env, form)
    }
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
