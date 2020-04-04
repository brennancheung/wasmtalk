import React from 'react'
import './App.css'

import WasmModuleViewer from './WasmModuleViewer'

import { decodeWasm } from './wasm/decode'
import { adderBytes } from './wasm/mocks/mocks'

const adderModule = decodeWasm(new Uint8Array(adderBytes)).unwrap()

// import WasmAdd from './WasmAdd'
// import WasmAddEncoded from './WasmAddEncoded'

// <WasmAddEncoded />

function App() {
  return (
    <WasmModuleViewer wasmModule={adderModule} />
  )
}

export default App