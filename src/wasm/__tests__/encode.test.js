import { adderBytes } from '../mocks/mocks'
import { Op, ValType } from '../wasm'
import {
  encodeModule,
  encodeOp,
  encodeString,
  encodeTypeSection,
  float,
  uint,
  sint,
  vector,
} from '../encode'

describe('ValType', () => {
  it('encodes ValType to binary', () => {
    expect(ValType.i32).toEqual(0x7F)
    expect(ValType.i64).toEqual(0x7E)
    expect(ValType.f32).toEqual(0x7D)
    expect(ValType.f64).toEqual(0x7C)
  })

  it('decodes binary to ValType string', () => {
    expect(ValType[0x7F]).toEqual('i32')
  })

  it('decodes binary to ValType enum', () => {
    expect(0x7F).toEqual(ValType.i32)
  })
})

describe('numeric encoding', () => {
  it('encodes unsigned LEB128', () => {
    expect(uint(42)).toEqual([42])
    expect(uint(0xFF)).toEqual([0xFF, 0x01])
    expect(uint(0x80)).toEqual([0x80, 0x01])
    expect(uint(0x87)).toEqual([0x87, 0x01])
  })

  it('encodes a signed LEB128', () => {
    expect(sint(42)).toEqual([42])
    expect(sint(-1)).toEqual([0xFF, 0xFF, 0xFF, 0xFF, 0x0F])
  })

  it('encodes float', () => {
    expect(float(3.14)).toEqual([195, 245, 72, 64])
  })
})

describe('misc encoding', () => {
  it('encodes vectors', () => {
    expect(vector([10, 11, 12])).toEqual([3, 10, 11, 12])
  })

  it('encodes strings', () => {
    expect(encodeString('ABC')).toEqual([3, 65, 66, 67])
  })
})

describe('module encoding', () => {
  it('encodes an empty module', () => {
    expect(encodeModule({})).toEqual([
      0x00, 0x61, 0x73, 0x6D, // magic header
      0x01, 0x00, 0x00, 0x00  // version 1
    ])
  })

  it('encode adder WASM module', () => {
    const spec = {
      functions: [
        {
          name: 'add',
          params: [ValType.i32, ValType.i32],
          results: [ValType.i32],
          code: [
            ...encodeOp(Op.localGet, 0),
            ...encodeOp(Op.localGet, 1),
            ...encodeOp(Op.i32Add),
            ...encodeOp(Op.end),
          ],
          shouldExport: true
        }
      ]
    }
    const data = encodeModule(spec)
    expect(data).toEqual(adderBytes)
  })
})

describe('type section', () => {
  it('encodes a simple type section', () => {

    const data = encodeTypeSection([
      { params: [ValType.i32, ValType.i32], results: [ValType.i32] }
    ])
    expect(data).toEqual([
      0x01, 0x07, 0x01, 0x60, // type section
      0x02, 0x7F, 0x7F, // 2 params (i32, i32)
      0x01, 0x7F, // 1 result (i32)
    ])
  })
})