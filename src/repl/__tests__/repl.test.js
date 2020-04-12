import { parseInput, Repl } from '../repl'
import { ValType, Op } from '../../wasm/wasm'
import { AstNode, AstNodeType, IntNode, AddNode } from '../../ast/AstNode'

describe('parseInput', () => {
  it('parses i32 ints', () => {
    expect(parseInput('42').unwrap()).toMatchObject({ type: AstNodeType.Int, value: 42 })
  })

  it('parses f32 ints', () => {
    expect(parseInput('3.14').unwrap()).toMatchObject({ type: AstNodeType.Float, value: 3.14 })
  })
})

describe('REPL', () => {
  it('initializes an empty REPL', () => {
    const repl = new Repl()
    expect(repl.stack.length).toEqual(0)
  })

  it('pushes constants onto the stack', () => {
    const repl = new Repl()
    repl.parse('10')
    repl.parse('11')
    expect(repl.stack.length).toEqual(2)
  })

  it('i32.add', () => {
    const repl = new Repl()
    repl.parse('10')
    repl.parse('11')
    repl.parse('+')
    expect(repl.stack.length).toEqual(1)
    expect(repl.stack[0].value).toEqual(21)
    expect(repl.nodes.length).toEqual(3)
  })

  it('records the op codes as it goes', () => {
    const repl = new Repl()
    repl.parse('10')
    repl.parse('11')
    repl.parse('+')
    expect(repl.compile()).toEqual([
      { code: Op.i32Const, params: 10 },
      { code: Op.i32Const, params: 11 },
      { code: Op.i32Add },
      { code: Op.end },
    ])
  })
})