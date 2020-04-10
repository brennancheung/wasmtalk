import WasmBuilder from '../WasmBuilder'
import { Op, ValType } from '../wasm'
import { encodeOp } from '../encode'
import { adderBytes } from '../mocks/mocks'

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

describe('WasmBuilder', () => {
  it('should build and compile the module', () => {
    const builder = new WasmBuilder()
    builder.process({ type: 'AddFunction', payload: addFunctionSpec })
    const wasmModule = builder.compile()
    expect(wasmModule).toEqual(adderBytes)
  })
})