import Result from './fp/Result'

type SideEffectFn = () => void
type ResultFn<T> = () => Result<T>

export const iota = (n: number): number[] => {
  let arr = []
  for (let i=0; i<n; i++) arr.push(i)
  return arr
}

// These are similar but the type checking provides some small benefit.
export const times = (n: number, fn: SideEffectFn) => iota(n).map(fn)
export const collectN = <T>(n: number, fn: ResultFn<T>): Result<T>[] => iota(n).map(fn)