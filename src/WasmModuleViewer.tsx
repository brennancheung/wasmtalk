import React from 'react'
import { ExportDesc, Op, OpCode, SectionId, ValType } from './wasm/wasm'
import { CodeEntry, ExportEntry, Local, TypeFunc, SectionContent, WasmModule } from './wasm/decode'
import { iota } from './util'

export const ModuleSummary = ({ wasmModule }: Props) => {
  const { version, sections } = wasmModule
  const sectionNames = sections.map(x => SectionId[x.id])
  return (
    <div className="ModuleSummary">
      <div className="title">Module Summary</div>
      <div>Version: {version} </div>
      <div>Sections: {sectionNames.join(', ')}</div>
    </div>
  )
}

interface ITypeSection {
  content: TypeFunc[]
}

export const TypeSection = ({ content }: ITypeSection) => {
  const renderType = (type: TypeFunc, idx: number) => {
    const params = type.params.map(x => ValType[x])
    const results = type.results.map(x => ValType[x])
    return (
      <div className="TypeSectionType">
        <code className="TypeSignature">type[{idx}] ({params.join(', ')}) -> {results.join(', ')}</code>
      </div>
    )
  }
  return (
    <div className="ModuleSection TypeSection">
      <div className="title">Type Section</div>
      {content.map(renderType)}
    </div>
  )
}

export const FunctionSection = ({ content }: { content: number[] }) => {
  return (
    <div className="ModuleSection TypeSection">
      <div className="title">Function Section</div>
      {content.map((funcIdx, arrIdx) => (
        <code>func[{arrIdx}] sig={funcIdx}</code>
      ))}
    </div>
  )
}

export const ExportSection = ({ content }: { content: ExportEntry[] }) => {
  const renderExport = ({ name, desc, index }: ExportEntry) => (
    <code>{ExportDesc[desc]}[{index}] "{name}"</code>
  )

  return (
    <div className="ModuleSection ExportSection">
      <div className="title">Export Section</div>
      {content.map(renderExport)}
    </div>
  )
}

const expandLocal = (local: Local) => iota(local.count).map(x => local.type)

const op2Str = ({ code, params }: OpCode) => {
  if (code === Op.localGet) return `local.get ${params}`
  if (code === Op.i32Add) return `i32.add`
  if (code === Op.end) return `end`
  return `${Op[code]}, params: ${JSON.stringify(params || null)}`
}

export const CodeSection = ({ content }: { content: CodeEntry[] }) => {
  const renderLocal = (type: ValType, idx: number) => (
    <code>{idx}: {ValType[type]}</code>
  )
  const renderCodeEntry = ({ locals, code }: CodeEntry, idx: number) => {
    const _locals = locals.map(expandLocal).flat()
    return (
      <div className="CodeEntry">
        <br />
        <div className="title">func[{idx}]</div>
        <div>Locals: [{_locals.map(renderLocal)}]</div>
        <code className="CodeDisassembly">
          {code.map(op2Str).map(x => <div className="DisassemblyLine">{x}</div>)}
        </code>
      </div>
    )
  }

  return (
    <div className="ModuleSection CodeSection">
      <div className="title">Code Section</div>
      {content.map(renderCodeEntry)}
    </div>
  )
}

export const CodeDisassembly = () => null
export const HexViewer = () => null

interface Props {
  wasmModule: WasmModule,
}

const WasmModuleViewer = ({ wasmModule }: Props) => {
  const { sections } = wasmModule
  const renderSection = (section: SectionContent) => {
    if (section.id === SectionId.Type) return <TypeSection content={section.content} />
    if (section.id === SectionId.Function) return <FunctionSection content={section.content } />
    if (section.id === SectionId.Export) return <ExportSection content={section.content } />
    if (section.id === SectionId.Code) return <CodeSection content={section.content } />
  }
  return (
    <div className="WasmModuleViewer">
      WASM Module Viewer
      <br />
      <br />
      <ModuleSummary wasmModule={wasmModule} />
      <br />
      <br />
      {sections.map(renderSection)}
      <pre>{JSON.stringify(wasmModule, null, 4)}</pre>
    </div>
  )
}

export default WasmModuleViewer