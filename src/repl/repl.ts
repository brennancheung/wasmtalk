import Result from "../fp/Result"
import { OpCode, ValType } from "../wasm/wasm"
import { evalNode, AstNode, AstNodeType, IntNode, AddNode, FloatNode } from "../ast/AstNode"
import { compile } from "../compile/compiler"

interface I32 { type: ValType.i32, value: number }
interface F32 { type: ValType.f32, value: number }
interface I64 { type: ValType.i64, value: number }
interface F64 { type: ValType.f64, value: number }
interface OpInstr { type: 'Op', value: OpCode }

export type WasmType = I32 | F32 | I64 | F64 | OpInstr

export const strIsInt = (str: string) => parseFloat(str) % 1 === 0
export const strIsFloat = (str: string) => parseFloat(str) %1 !== 0

export const parseInput = (str: string): Result<AstNode> => {
  if (!isNaN(str as any)) {
    if (strIsInt(str)) return Result.from(IntNode(parseInt(str)))
    if (strIsFloat(str)) return Result.from(FloatNode(parseFloat(str)))
  }

  if (str === '+') return Result.from(AddNode())
  return Result.throw(`Unable to parse input: ${str}`)
}

export class Repl {
  public stack: AstNode[]
  public ops: OpCode[]
  public nodes: AstNode[]

  constructor () {
    this.stack = []
    this.ops = []
    this.nodes = []
  }

  parse (input: string) {
    const result = parseInput(input)
    if (result.isErr) return result
    const node = result.unwrap()
    this.nodes.push(node)
    this.stack.push(this.eval(node))
  }

  eval (node: AstNode): AstNode {
    if (node.type === AstNodeType.Add) {
      // TODO: perform validation
      const left = this.stack.pop()
      const right = this.stack.pop()
      return evalNode(AddNode(left, right))
    }
    return node
  }

  validateStack (params: ValType[]) {
    return true
  }

  compile (): OpCode[] {
    return compile(this.nodes)
  }
}