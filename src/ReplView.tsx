import React, { useState } from 'react'
import { Repl, WasmType } from './repl/repl'
import { ValType, Op } from './wasm/wasm'
import { OpCode } from './wasm/decode'

const repl = new Repl()

const ReplView = () => {
  const [stack] = useState(repl.stack)
  const [input, setInput] = useState('')
  const handleChange = (e: any) => {
    setInput(e.target.value)
  }
  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      repl.parse(input)
      setInput('')
    }
  }

  return (
    <div>
      <input value={input} onChange={handleChange} onKeyDown={handleKeyDown} />
      <StackContents stack={stack} />
      <br />
      <br />
      <OpsContents ops={repl.ops} />
    </div>
  )
}

const StackContents = ({ stack }: { stack: WasmType[] }) => {
  const renderStackEntry = (entry: WasmType, idx) => {
    const key = `${JSON.stringify(entry)}-${idx}`
    return <div key={key}>{entry.value} : {ValType[entry.type]}</div>
  }
  return <div children={stack.map(renderStackEntry)} />
}

const OpsContents = ({ ops }: { ops: OpCode[] }) => {
  const renderOp = (op: OpCode, idx) => {
    const key = `${JSON.stringify(op)}-${idx}`
    return <div key={key}>{Op[op.code]} {op.params}</div>
  }
  return <div children={ops.map(renderOp)} />
}

export default ReplView