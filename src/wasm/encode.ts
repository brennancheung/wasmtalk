import { equals, findIndex, uniq } from 'ramda'
import { header, ExportDesc, FuncSpec, FuncType, ModuleSpec, Op, SectionId } from './wasm'

// WASM uses LEB128 encoding except for the module version, which uses u32
export const u32 = (n: number) => [
  n & 0xFF,
  (n & ((0xFF) << 8)) >> 8, 
  (n & ((0xFF) << 16)) >> 16, 
  (n & ((0xFF) << 24)) >> 24,
]

// unsigned LEB128
export const uint = (n: number) => {
  let bytes = []
  do {
    let byte = n & 0x7F
    n >>>= 7
    if (n !== 0) byte |= 0x80
    bytes.push(byte)
  } while (n !== 0)
  return bytes
}

// signed LEB128
export const sint = (n: number) => {
  let bytes = []
  while (true) {
    let byte = n & 0x7F
    let signed = byte & 0x40
    n >>>= 7
    if ((!signed && n === 0) || (signed && n === -1)) return [...bytes, byte]
    bytes.push(byte | 0x80)
  }
}

export const float = (n: number) => {
  let buf = Buffer.alloc(4)
  buf.writeFloatLE(n, 0)
  return Array.from(buf)
}

export const vector = (data: any[]) => [...uint(data.length), ...data].flat()

export const encodeString = (str: string) => [str.length, ...str.split('').map(ch => ch.charCodeAt(0))]

export const extractFnType = (spec: FuncSpec) => ({
  params: spec.params || [],
  results: spec.results || [],
})

export const encodeModule = (spec: ModuleSpec) => {
  let fnTypes: any[] = uniq((spec.functions || []).map(extractFnType))

  let bytes = [
    ...header, // magic header of "\0asm"
    ...u32(spec.version || 1),
    ...encodeTypeSection(fnTypes),
    ...encodeFuncSection(fnTypes, spec.functions),
    ...encodeExportSection(spec.functions),
    ...encodeCodeSection(spec.functions),
  ]
  return bytes
}

export const encodeContent = (bytes: number[]) => [bytes.length, ...bytes]

export const encodeFuncType = (ft: FuncType) => {
  const bytes = [
    ...vector(ft.params || []),
    ...vector(ft.results || []),
  ]
  return [
    0x60,
    ...bytes
  ]
}

export const encodeTypeSection = (fts: FuncType[] = []) => {
  if (fts.length === 0) return []
  const content = vector(fts.map(encodeFuncType))
  return [
    SectionId.Type,
    ...encodeContent(content)
  ]
}

export const encodeFuncSection = (fts: FuncType[] = [], fns: FuncSpec[] = []) => {
  if (fns.length === 0) return []

  const indexes = fns.map(extractFnType).map(ft => findIndex(equals(ft), fts))
  return [
    SectionId.Function,
    ...encodeContent(vector(indexes))
  ]
}

export const encodeFunctionExport = (fn: FuncSpec & { idx: number }) => {
  const bytes = [
    ...encodeString(fn.name || ''),
    ExportDesc.Func,
    fn.idx
  ]
  return bytes
}

export const encodeExportSection = (fns: FuncSpec[] = []) => {
  let fnExports: Array<FuncSpec & { idx: number }>  = []
  fns.forEach((fn, idx) => {
    if (!fn.shouldExport) return
    fnExports.push({ ...fn, idx })
  })
  if (fnExports.length === 0) return []
  const exportItems = fnExports.map(encodeFunctionExport)
  return [
    SectionId.Export,
    ...encodeContent(vector(exportItems))
  ]
}

export const encodeCodeSection = (fns: FuncSpec[] = []) => {
  if (fns.length === 0) return []
  const content: number[] = vector(fns.map(encodeCodeEntry))
  return [
    SectionId.Code,
    ...encodeContent(content),
  ]
}

export const encodeCodeEntry = (fn: FuncSpec) => {
  const contents: number[] = [
    ...vector(fn.locals || []),
    ...fn.code,
  ]
  return [
    ...encodeContent(contents)
  ]
}

export const encodeOp = (op: Op, params: any) => {
  switch (op) {
    case Op.end: return [Op.end]
    case Op.localGet: return [Op.localGet, ...uint(params)]
    case Op.i32Add: return [Op.i32Add]
  }
  throw new Error(`Unhandled opcode ${op} ${Op[op]}`)
}