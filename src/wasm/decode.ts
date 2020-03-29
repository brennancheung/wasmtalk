import { header, SectionId } from './wasm'
import { equals } from 'ramda'
import ByteReader from './ByteReader'
import Result from '../fp/Result'

export const decodeU32 = (bytes: number[]) => {
  const num =
    bytes[0] +
    (bytes[1] << 8) +
    (bytes[2] << 16) +
    (bytes[3] << 24)
  return num
}

export const decodeWasm = (bytes: Uint8Array) => {
  const reader = new ByteReader(bytes)

  return Result.pipeK<number[]>(
    (_header: number[]) => {
      if (!equals(Array.from(_header), header)) return Result.throw('Invalid header')
      return Result.from(true) // value could be anything, we ignore it in the next step
    },
    () => reader.readExact(4),
    bytes => Result.from(decodeU32(bytes)),
    version => Result.from({ version })
  )(reader.readExact(4))
}

export const readSection = (reader: ByteReader) => {
  let section:any = {}

  // The WASM binary doesn't provide a total size to expect at the beginning of
  // the file so we have no choice but to try to read and if there are
  // no more bytes for a section then it is the end of the file.
  const initial = reader.readByte()
  if (initial.isErr) return Result.from(null)

  return Result.pipeK<any>(
    (id: number) => {
      section.id = id
      return Result.from({ id })
    },
    () => {
      const contentSize = readUint(reader)
      if (contentSize.isErr) return contentSize
      return reader.readExact(contentSize.unwrap())
    },
    (content: number[]) => Result.from({ ...section, content })
  )(initial)
}

export const readUint = (reader: ByteReader): Result<number> => {
  let value = 0
  for (let done=false, i=0; !done; i++) {
    const bytes = reader.readExact(1)
    if (bytes.isErr) return Result.throw('Insufficient bytes (reading uint)')
    const byte = bytes.unwrap()[0]
    done  = !(byte & 0x80)
    const partialValue = byte & ~0x80
    value += partialValue << (i * 8)
  }
  return new Result(value)
}

export const readTypeSection = (reader: ByteReader) => {
}

export const readFuncType = (reader: ByteReader) => {

}