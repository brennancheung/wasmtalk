import Result from '../fp/Result'

class ByteReader {
  cursor: number = 0
  bytes: Uint8Array

  constructor (bytes: Uint8Array) {
    this.bytes = bytes
    this.cursor = 0
  }

  static from (bytes: number[]) {
    return new ByteReader(new Uint8Array(bytes))
  }

  read (numBytes: number): Result<{ size: number, bytes: number[] }> {
    const len = this.bytes.length
    const end = (this.cursor + numBytes <= len)
      ? this.cursor + numBytes
      : len
    const bytes = this.bytes.slice(this.cursor, end)
    this.cursor = end
    return new Result({
      size: bytes.length,
      bytes: Array.from(bytes)
    })
  }

  readExact (numBytes: number): Result<number[]> {
    const value = this.read(numBytes)
    if (value.isErr) return new Result<number[]>(value.error())
    const unwrapped = value.unwrap()
    if (unwrapped.size !== numBytes) {
      return new Result<number[]>(new Error('Insufficient bytes'))
    }
    return new Result<number[]>(unwrapped.bytes)
  }

  readByte (): Result<number> {
    const result = this.readExact(1)
    if (result.isErr) return Result.from<number>(result.error)
    return Result.from(result.unwrap()[0])
  }
}

export default ByteReader