class Result<T> {
  value: T | Error
  constructor(v: T | Error) {
    this.value = v
  }

  static from<V>(v: V | Error): Result<V> {
    return new Result<V>(v)
  }

  // When we only care if something succeeded and the contents are irrelevant
  static any = new Result<any>(true)
  static none = new Result<any>(null) // Conflating with Maybe/Option monad for convenience

  // Performs pointwise Kleisi composition (composing `bind` calls).
  // Makes longer monadic chains much easier to read and write.
  static pipeK(...fns: Array<(v: any) => Result<any>>): (v: any) => Result<any> {
    return (initial: Result<any>): Result<any> =>
      initial.isErr
        ? initial
        : fns.reduce((accum, fn) => accum.bind(fn), initial)
  }

  static throw (str: string): Result<any> {
    return new Result(new Error(str))
  }

  // Transposes Result<T>[] into Result<T[]>
  // In other words, if any of the results are errored, the entire result is an error.
  static transposeArray<T>(arr: Result<T>[]): Result<T[]> {
    let results: T[] = []
    for (let i=0; i<arr.length; i++) {
      if (arr[i].isErr) return new Result<T[]>(arr[i].error)
      results.push(arr[i].unwrap())
    }
    return Result.from(results)
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
}

export default Result