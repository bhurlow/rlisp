const readline = require('readline')
const fs = require('fs')
const R = require('ramda')


function eval(ast) {}

// const example = ' (+ 1 (* 2 3)) '
const example = '(do-thing (another (* 80 10))'

console.log(parse(example))

function repl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('> ', input => {
    console.log(parse(input))
    rl.close()
    repl()
  })
}

// repl()
