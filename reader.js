
/*
 * reads strings into nested data structures
 * defers to native data structs where possible, 
 * e.g. list === Array, string === String 
 * implementation models Clojure EDN Reader 
 */ 

const R = require('ramda')
const { isWhitespace, isDigit } = require('./type')

function readList(chars, c) {
  let items = readDelimitedList(')', chars)
  return items
}

const matches = {
  '(': readList
}

function readDelimitedList(delim, chars, recurse) {
  var a = []

  // not clear how this is differnent from read at all
  // other than it accumulates an array of read objects
  while (true) {
    let ch = chars.shift()

    if (!ch) {
      throw new Error('EOF')
    }

    if (isWhitespace(ch)) {
      // not sure what to do here
    }

    if (ch === delim) {
      break
    }

    let matchFn = matches[ch]
    if (matchFn) {
      let type = matchFn(chars, ch)
      a.push(type)
    } else {
      chars.unshift(ch)
      let res = read(chars)
      a.push(res)
    }
  }

  return a
}

// subtype readers

function isTerminator(ch) {
  return ch === ')' || matches[ch]
}

function readToken(chars, ch) {
  let token = ch
  while (true) {
    let ch = chars.shift()
    if (!ch || isWhitespace(ch) || isTerminator(ch)) {
      chars.unshift(ch)
      return token
    }
    token += ch
  }
  return token
}

function readNumber(chars, ch) {
  // in java, this would expand to other
  // number types
  let token = readToken(chars, ch)
  return parseInt(token)
}

function read(chars) {
  while (true) {
    let ch = chars.shift()

    if (!ch) {
      console.log('EOF')
      break
    }

    if (isWhitespace(ch)) {
      return read(chars)
    }

    if (isDigit(ch)) {
      return readNumber(chars, ch)
    }

    // if the data type has a dispatch char
    // read to satisfy the type
    let matchFn = matches[ch]
    if (matchFn) {
      let type = matchFn(chars, ch)
      return type
    }

    // otherwise, interpret the symbol
    let token = readToken(chars, ch)
    return token
  }
}

function readString(input) {
  let chars = input.split('')
  return read(chars)
}

module.exports = {
  readString,
  read
}
