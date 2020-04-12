import { evalNode, AstNodeType, AddNode, FloatNode, IntNode } from "../AstNode";

describe('Add', () => {
  it('Adds 2 Ints', () => {
    const left = IntNode(5)
    const right = IntNode(7)
    const add = AddNode(left, right)
    const result = evalNode(add)
    expect(result).toEqual({ type: AstNodeType.Int, value: 12, children: [] })
  })

  it('Adds 2 Floats', () => {
    const left = FloatNode(1.11)
    const right = FloatNode(2.22)
    const add = AddNode(left, right)
    const result = evalNode(add)
    expect(result).toEqual({ type: AstNodeType.Float, value: 3.33, children: [] })
  })
})