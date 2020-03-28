import React, { useEffect, useState } from 'react'
import { encodeModule, encodeOp, valtype, Op } from './wasm/wasm'

var importObj = {
  imports: { log: (arg) => console.log(arg) }
}

const spec = {
  functions: [
    {
      name: 'add',
      params: [valtype.i32, valtype.i32],
      results: [valtype.i32],
      code: [
        ...encodeOp(Op.localGet, 0),
        ...encodeOp(Op.localGet, 1),
        ...encodeOp(Op.i32Add),
        ...encodeOp(Op.end),
      ],
      shouldExport: true
    }
  ]
}

const data = new Uint8Array(encodeModule(spec))

const WasmAddEncoded = () => {
  const [exports, setExports] = useState(null)
  useEffect(() => {
    (async () => {
      try {
        const results = await WebAssembly.instantiate(data, importObj)
        setExports(results.instance.exports)
      } catch (err) {
        console.log(err)
      }
    })()
  }, [])
  if (exports) {
    const num = exports.add(5, 7)
    return (
      <div>{num}</div>
    )
  }
  return (
    <div>Still loading...</div>
  )
}

export default WasmAddEncoded