import { equals, findIndex, uniq } from 'ramda'

export const header = [0x00, 0x61, 0x73, 0x6D] // "\0asm"

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

export enum valtype {
  i32 = 0x7F,
  i64 = 0x7E,
  f32 = 0x7D,
  f64 = 0x7C,
}

export enum Op {
  unreachable  = 0x00,
  nop          = 0x01,

  block        = 0x02,
  loop         = 0x03,
  ifOp         = 0x04,
  elseOp       = 0x05,
  end          = 0x0B,
  br           = 0x0C,
  brIf         = 0x0D,
  brTable      = 0x0E,
  ret          = 0x0F,
  call         = 0x10,
  callIndirect = 0x11,

  drop         = 0x1A,
  select       = 0x1B,

  localGet     = 0x20,
  localSet     = 0x21,
  localTee     = 0x22,
  globalGet    = 0x23,
  globalSet    = 0x24,

  i32Load      = 0x28,
  i64Load      = 0x29,
  f32Load      = 0x2A,
  f64Load      = 0x2B,

  i32Load8s    = 0x2C,
  i32Load8u    = 0x2D,
  i32Load16s   = 0x2E,
  i32Load16u   = 0x2F,
  i64Load8s    = 0x30,
  i64Load8u    = 0x31,
  i64Load16s   = 0x32,
  i64Load16u   = 0x33,
  i64Load32s   = 0x34,
  i64Load32u   = 0x35,

  i32Store     = 0x36,
  i64Store     = 0x37,
  f32Store     = 0x38,
  f64Store     = 0x39,

  i32Store8    = 0x3A,
  i32Store16   = 0x3B,
  i64Store8    = 0x3C,
  i64Store16   = 0x3D,
  i64Store32   = 0x3E,

  memorySize   = 0x3F,
  memoryGrow   = 0x40,

  i32Const     = 0x41,
  i64Const     = 0x42,
  f32Const     = 0x43,
  f64Const     = 0x44,

  i32Eqz       = 0x45,
  i32Eq        = 0x46,
  i32Ne        = 0x47,
  i32LtS       = 0x48,
  i32LtU       = 0x49,
  i32GtS       = 0x4A,
  i32GtU       = 0x4B,
  i32LeS       = 0x4C,
  i32LeU       = 0x4D,
  i32GeS       = 0x4E,
  i32GeU       = 0x4F,

  i64Eqz       = 0x50,
  i64Eq        = 0x51,
  i64Ne        = 0x52,
  i64LtS       = 0x53,
  i64LtU       = 0x54,
  i64GtS       = 0x55,
  i64GtU       = 0x56,
  i64LeS       = 0x57,
  i64LeU       = 0x58,
  i64GeS       = 0x59,
  i64GeU       = 0x5A,

  f32Eq        = 0x5B,
  f32Ne        = 0x5C,
  f32Lt        = 0x5D,
  f32Gt        = 0x5E,
  f32Le        = 0x5F,
  f32Ge        = 0x60,

  f64Eq        = 0x61,
  f64Ne        = 0x62,
  f64Lt        = 0x63,
  f64Gt        = 0x64,
  f64Le        = 0x65,
  f64Ge        = 0x66,

  i32Clz       = 0x67,
  i32Ctz       = 0x68,
  i32Popcnt    = 0x69,

  i32Add       = 0x6A,
  i32Sub       = 0x6B,
  i32Mul       = 0x6C,
  i32DivS      = 0x6D,
  i32DivU      = 0x6E,
  i32RemS      = 0x6F,
  i32RemU      = 0x70,
  i32And       = 0x71,
  i32Or        = 0x72,
  i32Xor       = 0x73,
  i32Shl       = 0x74,
  i32ShrS      = 0x75,
  i32ShrU      = 0x76,
  i32Rotl      = 0x77,
  i32Rotr      = 0x78,

  i64Clz       = 0x79,
  i64Ctz       = 0x7A,
  i64Popcnt    = 0x7B,

  i64Add       = 0x7C,
  i64Sub       = 0x7D,
  i64Mul       = 0x7E,
  i64DivS      = 0x7F,
  i64DivU      = 0x80,
  i64RemS      = 0x81,
  i64RemU      = 0x82,
  i64And       = 0x83,
  i64Or        = 0x84,
  i64Xor       = 0x85,
  i64Shl       = 0x86,
  i64ShrS      = 0x87,
  i64ShrU      = 0x88,
  i64Rotl      = 0x89,
  i64Rotr      = 0x8A,

  f32Abs       = 0x8B,
  f32Neg       = 0x8C,
  f32Ceil      = 0x8D,
  f32Floor     = 0x8E,
  f32Trunc     = 0x8F,
  f32Nearest   = 0x90,
  f32Sqrt      = 0x91,
  f32Add       = 0x92,
  f32Sub       = 0x93,
  f32Mul       = 0x94,
  f32Div       = 0x95,
  f32Min       = 0x96,
  f32Max       = 0x97,
  f32Copysign  = 0x98,

  f64Abs       = 0x99,
  f64Neg       = 0x9A,
  f64Ceil      = 0x9B,
  f64Floor     = 0x9C,
  f64Trunc     = 0x9D,
  f64Nearest   = 0x9E,
  f64Sqrt      = 0x9F,
  f64Add       = 0xA0,
  f64Sub       = 0xA1,
  f64Mul       = 0xA2,
  f64Div       = 0xA3,
  f64Min       = 0xA4,
  f64Max       = 0xA5,
  f64Copysign  = 0xA6,

  i32WrapI64    = 0xA7,
  i32Truncf32S  = 0xA8,
  i32Truncf32U  = 0xA9,
  i32Truncf64S  = 0xAA,
  i32Truncf64U  = 0xAB,
  i64ExtendI32S  = 0xAC,
  i64ExtendI32U  = 0xAD,
  i64Truncf32S   = 0xAE,
  i64Truncf32U   = 0xAF,
  i64Truncf64S   = 0xB0,
  i64Truncf64U   = 0xB1,

  f32ConvertI32S = 0xB2,
  f32ConvertI32U = 0xB3,
  f32ConvertI64S = 0xB4,
  f32ConvertI64U = 0xB5,
  f32DemoteF64   = 0xB6,

  f64ConvertI32S = 0xB7,
  f64ConvertI32U = 0xB8,
  f64ConvertI64S = 0xB9,
  f64ConvertI64U = 0xBA,
  f64PromteF32   = 0xBB,

  i32ReinterpretF32 = 0xBC,
  i64Reinterpretf64 = 0xBD,
  f32ReinterpretI32 = 0xBE,
  f64ReinterpretF32 = 0xBF,
}

export enum SectionId {
  Custom   = 0,
  Type     = 1,
  Import   = 2,
  Function = 3,
  Table    = 4,
  Memory   = 5,
  Global   = 6,
  Export   = 7,
  Start    = 8,
  Element  = 9,
  Code     = 10,
  Data     = 11,
}

export enum ExportDesc {
  Func   = 0,
  Table  = 1,
  Mem    = 2,
  Global = 3,
}

interface FuncType {
  params:  valtype[],
  results: valtype[],
}

interface FuncSpec {
  name?: string,
  shouldExport?: boolean,
  params?: valtype[],
  results?: valtype[],
  locals?: valtype[],
  code: any[],
}

interface ModuleSpec {
  version?: number
  types?: FuncType[],
  functions?: FuncSpec[],
}

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