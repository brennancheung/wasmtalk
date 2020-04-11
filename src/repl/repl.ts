import Result from "../fp/Result"
import { Op, ValType } from "../wasm/wasm"
import { OpCode } from "../wasm/decode"

interface I32 { type: ValType.i32, value: number }
interface F32 { type: ValType.f32, value: number }
interface I64 { type: ValType.i64, value: number }
interface F64 { type: ValType.f64, value: number }
interface OpInstr { type: 'Op', value: OpCode }

export type WasmType = I32 | F32 | I64 | F64 | OpInstr

export const strIsInt = (str: string) => parseFloat(str) % 1 === 0
export const strIsFloat = (str: string) => parseFloat(str) %1 !== 0

export const parseInput = (str: string): Result<WasmType> => {
  if (strIsInt(str)) return Result.from({ type: ValType.i32, value: parseFloat(str) })
  if (strIsFloat(str)) return Result.from({ type: ValType.f32, value: parseFloat(str) })
  return Result.throw(`Unable to parse input: ${str}`)
}

export class Repl {
  public stack: WasmType[]
  public ops: OpCode[]

  constructor () {
    this.stack = []
    this.ops = []
  }

  eval (input: WasmType) {
    if (input.type === ValType.i32) {
      this.stack.push(input)
      this.ops.push({ code: Op.i32Const, params: input.value })
    }

    if (input.type === ValType.f32) {
      this.stack.push(input)
      this.ops.push({ code: Op.f32Const, params: input.value })
    }

    if (input.type === ValType.i64) {
      this.stack.push(input)
      this.ops.push({ code: Op.i64Const, params: input.value })
    }

    if (input.type === ValType.f64) {
      this.stack.push(input)
      this.ops.push({ code: Op.f64Const, params: input.value })
    }

    if (input.type === 'Op') {
      this.evalOp(input.value)
    }
  }

  evalOp(op: OpCode) {
    if (op.code === Op.i32Add) {
      if (!this.validateStack([ValType.i32, ValType.i32])) throw new Error('Invalid params')
      const n1 = this.stack.pop() as I32
      const n2 = this.stack.pop() as I32
      this.stack.push({ type: ValType.i32, value: n1.value + n2.value })
      this.ops.push({ code: Op.i32Add })
    }
  }

  validateStack (params: ValType[]) {
    return true
  }

}