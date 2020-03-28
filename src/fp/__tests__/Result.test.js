import Result from '../Result'

const double = n => n * 2
const genError = n => new Error('an error')

describe('Result', () => {
  it('propagates errors forward', () => {
    const result = new Result(1)
      .map(double)
      .map(genError)
      .map(double)
    expect(result.isErr()).toEqual(true)
    expect(result.isOk()).toEqual(false)
  })

  it('propagates values forward', () => {
    const result = new Result(1)
      .map(double)
      .map(double)
      .map(double)
    expect(result.isErr()).toEqual(false)
    expect(result.isOk()).toEqual(true)
  })

  it('unwraps values', () => {
    const result = new Result(1)
      .map(double)
      .unwrap()
    expect(result).toEqual(2)
  })
})