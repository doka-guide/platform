const { setPath } = require('../collection-helpers/set-path')

describe('setPath', () => {
  it('creates object hierarchy', () => {
    const foo = {}
    const result = setPath(['a', 'b', 'c'], 1, foo)

    expect(result).toEqual({ a: { b: { c: 1 } } })
  })

  it('sets object value', () => {
    const foo = { a: { b: { c: 1 } } }
    const result = setPath(['a', 'b', 'c'], 2, foo)

    expect(result).toEqual({ a: { b: { c: 2 } } })
  })

  it('if path has a number creates an array', () => {
    const foo = {}
    const result = setPath(['a', 1, 'c'], 2, foo)

    expect(result).toEqual({ a: [undefined, { c: 2 }] })
  })

  it('if the first element is a number and an initial value is a number creates an array', () => {
    const foo = []
    const result = setPath([1, 'c'], 2, foo)

    expect(result).toEqual([undefined, { c: 2 }])
  })
})
