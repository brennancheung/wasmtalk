import Result from './fp/Result'

type SideEffectFn = () => void
type ResultFn<T> = () => Result<T>

export const iota = (n: number): number[] => {
  let arr = [] as number[]
  for (let i=0; i<n; i++) arr.push(i)
  return arr
}

export const times = (n: number, fn: SideEffectFn) => iota(n).map(fn)

// Convenience util to collect a bunch of results together into a single array.
export const collectN = <T>(n: number, fn: ResultFn<T>): Result<T[]> =>
  Result.transposeArray<T>(iota(n).map(fn))