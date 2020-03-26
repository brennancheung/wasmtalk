import React, { useEffect, useState } from 'react'

var importObj = {
  imports: { log: (arg) => console.log(arg) }
}
const WasmAdd = () => {
  const [exports, setExports] = useState(null)
  useEffect(() => {
    (async () => {
      try {
        const bytes = await (await fetch('add.wasm')).arrayBuffer()
        const results = await WebAssembly.instantiate(bytes, importObj)
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

export default WasmAdd