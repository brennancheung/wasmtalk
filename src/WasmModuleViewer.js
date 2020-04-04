import React from 'react'

import { deocde } from './wasm/decode'
import { adderBytes } from './wasm/mocks/mocks'

export const SectionSummary = () => null
export const TypeSection = () => null
export const CodeDisassembly = () => null
export const FunctionSection = () => null
export const ExportSection = () => null
export const CodeSection = () => null
export const HexViewer = () => null

const WasmModuleViewer = () => {
  return (
    <div className="WasmModuleViewer">
      WASM Module Viewer
    </div>
  )
}

export default WasmModuleViewer