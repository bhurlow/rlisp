
const { readString } = require('../reader')
const { evalForm } = require('../eval')
const { List } = require('../immutable.js')

test('basic math eval', async () => {

  const input = `
    (* 5 (+ 10 5))
  `

  let form = readString(input)
  let res = evalForm(form)

  expect(res).toBe(75)

})


test('first', async () => {

  const input = `
    (first '(5 10))
  `

  let form = readString(input)
  let res = evalForm(form)

  expect(res).toBe(5)

})

test('rest', async () => {

  const input = `
    (rest '(5 10 11))
  `

  let form = readString(input)
  let res = evalForm(form)

  expect(res).toEqual(new List([10,11]))

})
