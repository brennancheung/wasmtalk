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

export const decodeWasm = (bytes: Uint8Array)  => {
  const reader = new ByteReader(bytes)

  const maybeHeader = reader.read(4)
  if (maybeHeader.size !== 4) return { valid: false, reason: 'Invalid header' }
  if (!equals(maybeHeader.bytes, header)) return { valid: false, reason: 'Invalid header' }

  let maybeVersion = reader.read(4)
  if (maybeVersion.size !== 4) return { valid: false, reason: 'Invalid version' }
  const version = decodeU32(maybeVersion.bytes)
  return { valid: true, version }
}

export const readSection = (reader: ByteReader) => {
  const maybeSectionId = reader.read(1)
  if (maybeSectionId.size === 0) return { valid: true, contents: null }
  const sectionId = maybeSectionId.bytes[0]
  if (!SectionId[sectionId]) return { valid: false, reason: 'Unknown section type' }

  const maybeContentSize = readUint(reader)
  if (!maybeContentSize.valid) return { valid: false, reason: 'Insufficient bytes (reading uint)'}
  const contentSize = maybeContentSize.value || 0

  const maybeContents = reader.read(contentSize)
  if (maybeContents.size !== contentSize) return { valid: false, reason: 'Insufficient bytes (reading section contents)'}

  const contents = maybeContents.bytes
  return { valid: true, id: sectionId, contents }
}

export const readUint = (reader: ByteReader) => {
  let value = 0
  for (let done=false, i=0; !done; i++) {
    const maybeByte = reader.read(1)
    if (maybeByte.size === 0) return new Result(new Error('Insufficient bytes (reading uint)'))
    const byte = maybeByte.bytes[0]
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