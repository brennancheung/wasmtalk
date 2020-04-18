import React, { useState } from 'react'
import { Repl } from './repl/repl'
import { Op, OpCode } from './wasm/wasm'
import { AstNode, AstNodeType } from './ast/AstNode'

const repl = new Repl()

const preventSubmit = e => e.preventDefault()

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
    <React.Fragment>
      <div className="uk-card uk-card-primary uk-card-body uk-margin">
        <div className="uk-card-title">Input</div>
        <form onSubmit={preventSubmit}>
          <input className="uk-input" value={input} onChange={handleChange} onKeyDown={handleKeyDown} />
        </form>
      </div>
      <StackContents stack={stack} />
      <OpsContents ops={repl.compile()} />
    </React.Fragment>
  )
}

const StackContents = ({ stack }: { stack: AstNode[] }) => {
  const renderStackNode = (node: AstNode, idx) => {
    const key = `${JSON.stringify(node)}-${idx}`
    return (
      <li className="uk-margin-remove" key={key}>
        <span className="uk-label uk-label-default">{node.value}</span>
        <span className="uk-label uk-label-success uk-margin-small-left">{AstNodeType[node.type]}</span>
      </li>
    )
  }
  return (
    <div className="uk-card uk-card-default uk-card-body uk-margin">
      <div className="uk-card-title">Stack Contents</div>
      <ul className="uk-list" children={stack.map(renderStackNode)} />
    </div>
  )
}

const OpsContents = ({ ops }: { ops: OpCode[] }) => {
  const renderOp = (op: OpCode, idx) => {
    const key = `${JSON.stringify(op)}-${idx}`
    return (
      <li className="uk-margin-remove" key={key}>
        <span className="uk-label uk-label-default">{Op[op.code]}</span>
        {op.params && <span className="uk-label uk-label-success uk-margin-small-left">{op.params}</span>}
      </li>
    )
  }
  return (
    <div className="uk-card uk-card-default uk-card-body uk-margin">
      <div className="uk-card-title">Op Codes</div>
      <ul className="uk-list" children={ops.map(renderOp)} />
    </div>
  )
}

export default ReplView