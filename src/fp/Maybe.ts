abstract class Maybe<T> {
  abstract bind<T1>(f: (v: T) => Maybe<T1>): Maybe<T1>
}

export class Some<T> extends Maybe<T> {
  value: T;

  bind<T1>(f: (v: T) => Maybe<T1>): Maybe<T1> {
    return f(this.value)
  }

  constructor(value: T) {
    super()
    this.value = value
  }
}

export class None<T> extends Maybe<T> {
  bind<T1>(f: (v: T) => Maybe<T1>): Maybe<T1> {
    return new None<T1>()
  }
}