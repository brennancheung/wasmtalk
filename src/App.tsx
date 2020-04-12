import React from 'react'
import './App.css'

import WasmModuleViewer from './WasmModuleViewer'
import ReplView from './ReplView'

import { decodeWasm } from './wasm/decode'
import { adderBytes } from './wasm/mocks/mocks'

const adderModule = decodeWasm(new Uint8Array(adderBytes)).unwrap()

// import WasmAdd from './WasmAdd'
// import WasmAddEncoded from './WasmAddEncoded'

// <WasmAddEncoded />

function App() {
  if (false) {
    return <WasmModuleViewer wasmModule={adderModule} />
  }

  return <ReplView />
}

export default App