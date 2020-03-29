import Result from '../Result'

const double = n => n * 2
const genError = n => new Error('an error')

const maybeDouble = n => Result.from(n * 2)
const resultError = n => Result.from(new Error('an error'))

describe('Result', () => {
  it('propagates errors forward', () => {
    const result = new Result(1)
      .map(double)
      .map(genError)
      .map(double)
    expect(result.isErr).toEqual(true)
    expect(result.isOk).toEqual(false)
  })

  it('propagates values forward', () => {
    const result = new Result(1)
      .map(double)
      .map(double)
      .map(double)
    expect(result.isErr).toEqual(false)
    expect(result.isOk).toEqual(true)
  })

  it('unwraps values', () => {
    const result = new Result(1)
      .map(double)
      .unwrap()
    expect(result).toEqual(2)
  })

  it('supports Kleisli composition', () => {
    let result = Result.from(1)
      .bind(maybeDouble)
      .bind(maybeDouble)
    expect(result.unwrap()).toEqual(4)
  })

  it('short-circuits errors in Kleisli composition', () => {
    let touched = false
    const result = Result.from(1)
      .bind(resultError)
      .bind(maybeDouble)
      .bind(() => {
        // this code will never be run
        touched = true
        return Result.from(123)
      })
      .bind(maybeDouble)
    expect(result.isErr).toEqual(true)
    expect(touched).toEqual(false)
  })
})