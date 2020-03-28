class Result<T> {
  value: T | Error
  constructor(v: T | Error) {
    this.value = v
  }

  static from<V>(v: V | Error): Result<V> {
    return new Result<V>(v)
  }

  map<U> (f: (v: T | Error) => U): Result<U> {
    if (this.value instanceof Error) return Result.from<U>(this.value)
    return new Result(f(this.value))
  }

  bind<U> (f: (v: T) => Result<U>): Result<U> {
    if (this.value instanceof Error) {
      return Result.from<U>(this.value)
    }
    return f(this.value)
  }

  isOk () { return !(this.value instanceof Error) }
  isErr () { return this.value instanceof Error }

  unwrap (): T | never {
    if (this.value instanceof Error) {
      throw new Error(`Failed to unwrap errored Result`)
    }
    return this.value
  }

  error (): Error | never {
    if (this.value instanceof Error) return this.value
    throw new Error(`Result is not in error.  Cannot get error.`)
  }
}

export default Result