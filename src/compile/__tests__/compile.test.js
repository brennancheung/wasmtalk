import { compile } from "../compiler";
import { AstNodeType, IntNode, AddNode } from "../../ast/AstNode";
import { OpCode, Op } from '../../wasm/wasm'

const addNodes = [
  IntNode(5),
  IntNode(7),
  AddNode(),
  AddNode(),
]

describe('Compile', () => {
  it('converts nodes to code', () => {
    const ops = compile(addNodes)
    expect(ops).toEqual([
      { code: Op.i32Const, params: 5 },
      { code: Op.i32Const, params: 7 },
      { code: Op.i32Add },
      { code: Op.i32Add },
      { code: Op.end },
    ])
  })
})