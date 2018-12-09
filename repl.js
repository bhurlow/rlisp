const readline = require('readline')
const fs = require('fs')
const R = require('ramda')

const { readString } = require('./reader')
const { evalForm } = require('./eval')

function evalString(input) {
  let form = readString(input)
  let res = evalForm(form)
  // TODO
  // printer?
  return res
}

function repl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('> ', input => {
    let res = evalString(input)
    console.log(res)
    rl.close()
    repl()
  })
}

repl()
