const { readString, readAll } = require('../src/reader')
const { evalForm, evalForms } = require('../src/eval')

const { List, Numeric, Symbolic } = require('../src/types')

test('basic math eval', async () => {
  const input = `
    (* 5 (+ 10 5))
  `

  let form = readString(input)
  let res = evalForm(form)

  expect(res.number).toBe(75)
})

test('first', async () => {
  const input = `
    (first '(5 10))
  `

  let form = readString(input)
  let res = evalForm(form)

  expect(res.number).toBe(5)
})

test('rest', async () => {
  const input = `
    (rest '(5 10 11))
  `

  let form = readString(input)
  let res = evalForm(form)

  let expected = new List([new Numeric(10), new Numeric(11)])
  expect(res).toEqual(expected)
})

test('lambda', async () => {
  const input = `
    ((fn '(x) (+ x 5)) 6)
  `

  let form = readString(input)
  let res = evalForm(form)

  expect(res.number).toEqual(11)
})

test('def', async () => {
  const input = `
    (def 'foo 99)
    (+ 1 foo)
  `

  let forms = readAll(input)
  let res = evalForms(forms)

  expect(res[1].number).toEqual(100)
})
