import { adderBytes } from '../mocks/mocks'
import { ExportDesc, Op, SectionId, ValType } from '../wasm'
import {
  encodeCodeSection,
  encodeExportSection,
  encodeFuncSection,
  encodeModule,
  encodeOp,
  encodeString,
  encodeTypeSection,
  float,
  uint,
  sint,
  vector,
} from '../encode'

const addFunctionSpec = {
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
      functions: [addFunctionSpec]
    }
    const data = encodeModule(spec)
    expect(data).toEqual(adderBytes)
  })
})

// For binary encoding format see the spec at:
// https://webassembly.github.io/spec/core/binary/modules.html
describe('sections', () => {
  it('encodes the "Type" section', () => {
    const data = encodeTypeSection([
      { params: [ValType.i32, ValType.i32], results: [ValType.i32] }
    ])
    expect(data).toEqual([
      0x01, 0x07, 0x01, 0x60, // type section
      0x02, 0x7F, 0x7F, // 2 params (i32, i32)
      0x01, 0x7F, // 1 result (i32)
    ])
  })

  it('encodes the "Function" section', () => {
    const fnTypes = [{ params: addFunctionSpec.params, results: addFunctionSpec.results }]
    const fns = [addFunctionSpec]
    expect(encodeFuncSection(fnTypes, fns)).toEqual([
      SectionId.Function, // section id
      2, // content size 2 bytes
      1, // vector of size 1
      0 // function 0 points to index 0
    ])
  })
  
  it('encodes the "Export" section', () => {
    expect(encodeExportSection([addFunctionSpec])).toEqual([
      SectionId.Export, // export section
      7, // content size 7 bytes
      1, // vector size 1
      3, // string size
      97, 100, 100, // "add"
      ExportDesc.Func,
      0, // function index 0
    ])
  })

  it('encodes the "Code" section', () => {
    expect(encodeCodeSection([addFunctionSpec])).toEqual([
      SectionId.Code,
      9, // content size 9 bytes
      1, // vector size 1 code entry
      7, // size of code entry 7 bytes
      0, // vector size for number of locals
      Op.localGet,
      0, // $0
      Op.localGet,
      1, // $1
      Op.i32Add,
      Op.end,
    ])
  })
})