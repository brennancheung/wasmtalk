import { AstNodeType, AstNode } from "../ast/AstNode"
import { Op, OpCode } from "../wasm/wasm"

export const compile = (nodes: AstNode[]): OpCode[] => {
  const codes = nodes.map((node: AstNode): OpCode => {
    if (node.type === AstNodeType.Int) return { code: Op.i32Const, params: node.value }
    if (node.type === AstNodeType.Add) return { code: Op.i32Add }

    // catch-all
    console.error('Do not know how to compile node: ', node)
    return { code: Op.nop }
  })
  return [...codes, { code: Op.end }]
}