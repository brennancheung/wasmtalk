class Result<T> {
  value: T | Error
  constructor(v: T | Error) {
    this.value = v
  }

  static from<V>(v: V | Error): Result<V> {
    return new Result<V>(v)
  }

  // Performs pointwise Kleisi composition (composing `bind` calls).
  // Makes longer monadic chains much easier to read and write.
  static pipeK<T>(...fns: Array<(v: any) => Result<any>>): (v: any) => Result<any> {
    return (initial: Result<any>): Result<any> =>
      initial.isErr
        ? initial
        : fns.reduce((accum, fn) => accum.bind(fn), initial)
  }

  map<U> (f: (v: T | Error) => U): Result<U> {
    if (this.value instanceof Error) return Result.from<U>(this.value)
    return new Result(f(this.value))
  }

  bind<U> (f: (v: T) => Result<U>): Result<U> {
    if (this.value instanceof Error) return Result.from<U>(this.value)
    return f(this.value)
  }

  get isOk () { return !(this.value instanceof Error) }
  get isErr () { return this.value instanceof Error }

  unwrap (): T | never {
    if (this.value instanceof Error) {
      throw new Error(`Failed to unwrap errored Result`)
    }
    return this.value
  }

  get error (): Error | never {
    if (this.value instanceof Error) return this.value
    throw new Error(`Result is not in error.  Cannot get error.`)
  }

  static throw (str: string): Result<any> {
    return new Result(new Error(str))
  }
}

export default Result