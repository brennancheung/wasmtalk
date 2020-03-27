import {
  encodeModule,
  encodeTypeSection,
  float,
  uint,
  sint,
  string,
  valtype,
  vector,
} from '../wasm'

describe('valtype', () => {
  it('encodes valtype to binary', () => {
    expect(valtype.i32).toEqual(0x7F)
    expect(valtype.i64).toEqual(0x7E)
    expect(valtype.f32).toEqual(0x7D)
    expect(valtype.f64).toEqual(0x7C)
  })

  it('decodes binary to valtype string', () => {
    expect(valtype[0x7F]).toEqual('i32')
  })

  it('decodes binary to valtype enum', () => {
    expect(0x7F).toEqual(valtype.i32)
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
    expect(string('ABC')).toEqual([3, 65, 66, 67])
  })
})

describe('module encoding', () => {
  it('encodes an empty module', () => {
    expect(encodeModule({})).toEqual([
      0x00, 0x61, 0x73, 0x6D, // magic header
      0x01, 0x00, 0x00, 0x00  // version 1
    ])
  })

  it('encode test', () => {
    const spec = {
      functions: [
        {
          name: 'add',
          params: [valtype.i32, valtype.i32],
          results: [valtype.i32],
          code: [],
          shouldExport: true
        }
      ]
    }
    const data = encodeModule(spec)
    expect(data).toEqual([
      0x00, 0x61, 0x73, 0x6D, // magic header
      0x01, 0x00, 0x00, 0x00, // version 1
      0x01, 0x07, 0x01, 0x60, // type section
      0x02, 0x7F, 0x7F, // 2 params (i32, i32)
      0x01, 0x7F, // 1 result (i32)
      0x03, 0x02, // function section (0x03), contents(0x02 bytes)
      0x01, 0x00, // vector(size=1) [type $0]
    ])
  })
})

describe('type section', () => {
  it('encodes a simple type section', () => {

    const data = encodeTypeSection([
      { params: [valtype.i32, valtype.i32], results: [valtype.i32] }
    ])
    expect(data).toEqual([
      0x01, 0x07, 0x01, 0x60, // type section
      0x02, 0x7F, 0x7F, // 2 params (i32, i32)
      0x01, 0x7F, // 1 result (i32)
    ])
  })
})