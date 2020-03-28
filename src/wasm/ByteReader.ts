class ByteReader {
  cursor: number = 0
  bytes: Uint8Array

  constructor (bytes: Uint8Array) {
    this.bytes = bytes
    this.cursor = 0
  }

  read (numBytes: number): { size: number, bytes: Array<number> } {
    const len = this.bytes.length
    const end = (this.cursor + numBytes <= len)
      ? this.cursor + numBytes
      : len
    const bytes = this.bytes.slice(this.cursor, end)
    this.cursor = end
    return {
      size: bytes.length,
      bytes: Array.from(bytes)
    }
  }
}

export default ByteReader