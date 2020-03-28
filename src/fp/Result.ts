// Not as type safe as could be but don't want the code
// to be unwieldy either.  Might improve in the future.
class Result {
  value: any | Error
  constructor(v: any | Error) {
    this.value = v
  }

  map (f: (v: any | Error) => Result) {
    if (this.value instanceof Error) return this
    return new Result(f(this.value))
  }

  isOk () { return !(this.value instanceof Error) }
  isErr () { return this.value instanceof Error }

  unwrap () {
    if (this.isErr()) throw new Error(`Failed to unwrap errored Result`)
    return this.value
  }
}

export default Result