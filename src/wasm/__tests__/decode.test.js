import ByteReader from '../ByteReader'
import { header, SectionId } from '../wasm'
import { decodeWasm, readUint, readSection } from '../decode'
import { adderBytes, typeSection, functionSection } from '../mocks/mocks'

const empty = new Uint8Array([])

describe('decodeWasm', () => {
  it('rejects invalid headers', () => {
    const bytes = new Uint8Array([0, 0, 0, 0, 1, 0, 0, 0])
    const result = decodeWasm(bytes)
    expect(result.isErr).toEqual(true)
    expect(result.error).toEqual(new Error('Invalid header'))
  })

  it('accepts a valid header and version', () => {
    const bytes = new Uint8Array(adderBytes)
    const result = decodeWasm(bytes)
    expect(result.unwrap()).toMatchObject({ version: 1 })
  })

  it('rejects invalid version', () => {
    const bytes = new Uint8Array([...header, 1, 0])
    const result = decodeWasm(bytes)
    expect(result.isErr).toEqual(true)
    expect(result.error).toEqual(new Error('Insufficient bytes'))
  })
})

describe('read int', () => {
  const bytes = new Uint8Array([0x70, 0x60, 0x50])

  it('rejects when insufficient bytes', () => {
    const reader = new ByteReader(empty)
    expect(readUint(reader).isErr).toEqual(true)
  })

  it('reads an values without high bit set', () => {
    const reader = new ByteReader(bytes)

    expect(readUint(reader).unwrap()).toEqual(0x70)
    expect(readUint(reader).unwrap()).toEqual(0x60)
    expect(readUint(reader).unwrap()).toEqual(0x50)
  })

  it('reads values with high bit', () => {
    // The high bit (0x80) is used to indicate that the int continues on the next byte.
    // Encoding is little endian.
    const bytes = new Uint8Array([
      0xFF, 0x11,
      0x80, 0x01,
      0x22,
      0xFF, 0x00,
      0x80, 0x80, 1,
    ])
    const reader = new ByteReader(bytes)
    expect(readUint(reader).unwrap()).toEqual((0xFF&~0x80) + (0x11 << 8))
    expect(readUint(reader).unwrap()).toEqual(1 << 8)
    expect(readUint(reader).unwrap()).toEqual(0x22)
    expect(readUint(reader).unwrap()).toEqual(0xFF&~0x80)
    expect(readUint(reader).unwrap()).toEqual(1 << 16)
  })
})

describe('section decoding', () => {
  const bytes = new Uint8Array(adderBytes.slice(8))

  it('only accepts known section headers', () => {
    const section = readSection(new ByteReader(bytes))
    expect(section.unwrap()).toMatchObject({ id: SectionId.Type, content: typeSection.slice(2) })
  })

  it('rejects sections that are too short', () => {
    const contentSize = 123
    const bytes = new Uint8Array([SectionId.Type, contentSize, 0, 0, 0])
    const section = readSection(new ByteReader(bytes))
    expect(section.isErr).toEqual(true)
  })

  it('reads a section at a time', () => {
    const bytes = new Uint8Array([ ...typeSection, ...functionSection ])
    const reader = new ByteReader(bytes)

    expect(readSection(reader).unwrap()).toEqual({ id: SectionId.Type, content: typeSection.slice(2) })
    expect(readSection(reader).unwrap()).toEqual({ id: SectionId.Function, content: functionSection.slice(2) })
    const result = readSection(reader)
    expect(result.unwrap()).toEqual(null)
  })
})

describe('type section decoding', () => {

})