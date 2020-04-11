import { parseInput, Repl } from '../repl'
import { ValType, Op } from '../../wasm/wasm'

describe('parseInput', () => {
  it('parses i32 ints', () => {
    expect(parseInput('42').unwrap()).toEqual({ type: ValType.i32, value: 42 })
  })

  it('parses f32 ints', () => {
    expect(parseInput('42').unwrap()).toEqual({ type: ValType.i32, value: 42 })
  })
})

describe('REPL', () => {
  it('initializes an empty REPL', () => {
    const repl = new Repl()
    expect(repl.stack.length).toEqual(0)
  })

  it('pushes constants onto the stack', () => {
    const repl = new Repl()
    repl.eval({ type: ValType.i32, value: 10 })
    repl.eval({ type: ValType.i32, value: 11 })
    expect(repl.stack.length).toEqual(2)
  })

  it('i32.add', () => {
    const repl = new Repl()
    repl.eval({ type: ValType.i32, value: 10 })
    repl.eval({ type: ValType.i32, value: 11 })
    repl.eval({ type: 'Op', value: { code: Op.i32Add } })
    expect(repl.stack.length).toEqual(1)
    expect(repl.stack[0].value).toEqual(21)
  })

  it('records the op codes as it goes', () => {
    const repl = new Repl()
    repl.eval({ type: ValType.i32, value: 10 })
    repl.eval({ type: ValType.i32, value: 11 })
    repl.eval({ type: 'Op', value: { code: Op.i32Add } })
    expect(repl.ops).toEqual([
      { code: Op.i32Const, params: 10 },
      { code: Op.i32Const, params: 11 },
      { code: Op.i32Add },
    ])
  })
})