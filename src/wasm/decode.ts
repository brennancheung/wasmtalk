import { header, ExportDesc, Op, OpCode, SectionId, ValType } from './wasm'
import { equals } from 'ramda'
import { collectN } from '../util'
import ByteReader from './ByteReader'
import Result from '../fp/Result'

export const decodeU32 = (bytes: number[]): number => {
  const num =
    bytes[0] +
    (bytes[1] << 8) +
    (bytes[2] << 16) +
    (bytes[3] << 24)
  return num
}

export interface WasmModule {
  version: number,
  sections: SectionContent[],
}
export const decodeWasm = (bytes: Uint8Array): Result<WasmModule> => {
  const reader = new ByteReader(bytes)
  const wasmModule = {} as WasmModule

  return reader.readExact(4).chainK(
    (_header: number[]) => {
      if (!equals(Array.from(_header), header)) return Result.throw('Invalid header')
      return Result.Ok // value could be anything, we ignore it in the next step
    },
    () => reader.readExact(4),
    bytes => Result.from(decodeU32(bytes)),
    (version: number) => {
      wasmModule.version = version
      return readSections(reader)
    },
    (sections: SectionContent[]) => {
      wasmModule.sections = sections
      return Result.from(wasmModule)
    }
  )
}

export const readSections = (reader: ByteReader): Result<SectionContent[]> => {
  let sections: SectionContent[] = []
  for (;;) {
    const section = readSection(reader)
    if (section === Result.None) return Result.from(sections)
    sections.push(section.unwrap())
  }
}

export interface SectionContent {
  id: SectionId,
  content: any[],
}

export const readSection = (reader: ByteReader): Result<SectionContent> => {
  let section = {} as SectionContent

  // The WASM binary doesn't provide a total size to expect at the beginning of
  // the file so we have no choice but to try to read and if there are
  // no more bytes for a section then it is the end of the file.
  const initial = reader.readByte()
  if (initial.isErr) return Result.None

  const sectionDecoders = {
    [SectionId.Custom]:   unimplemented,
    [SectionId.Type]:     readTypeSection,
    [SectionId.Import]:   unimplemented,
    [SectionId.Function]: readFunctionSection,
    [SectionId.Table]:    unimplemented,
    [SectionId.Memory]:   unimplemented,
    [SectionId.Global]:   unimplemented,
    [SectionId.Export]:   readExportSection,
    [SectionId.Start]:    unimplemented,
    [SectionId.Element]:  unimplemented,
    [SectionId.Code]:     readCodeSection,
    [SectionId.Data]:     unimplemented,
  }

  return initial.chainK(
    (id: number) => {
      section.id = id
      return Result.Ok
    },
    () => {
      const contentSize = readUint(reader)
      if (contentSize.isErr) return contentSize
      return reader.readExact(contentSize.unwrap())
    },
    (bytes: number[]) => {
      const id: SectionId = section.id
      const decoder = sectionDecoders[id]
      return decoder(bytes)
    },
    (content) => {
      section.content = content
      return Result.from(section)
    }
  )
}

export const readUint = (reader: ByteReader): Result<number> => {
  let value = 0
  for (let done=false, i=0; !done; i++) {
    const bytes = reader.readExact(1)
    if (bytes.isErr) return Result.throw('Insufficient bytes (reading uint)')
    const byte = bytes.unwrap()[0]
    done  = !(byte & 0x80)
    const partialValue = byte & ~0x80
    value += partialValue << (i * 8)
  }
  return new Result(value)
}

export const readString = (reader: ByteReader): Result<string> => {
  return readUint(reader).chainK(
    (strLen: number) => reader.readExact(strLen),
    (bytes: number[]) => {
      const str = bytes.map(x => String.fromCharCode(x)).join('')
      return Result.from(str)
    }
  )
}

export const unimplemented = (bytes: number[]) => Result.Ok

export interface TypeFunc {
  params: ValType[],
  results: ValType[],
}

export const readTypeSection = (bytes: number[]): Result<TypeFunc[]> => {
  const reader = ByteReader.from(bytes)
  return readUint(reader).chainK(
    (numParams: number) => collectN<TypeFunc>(numParams, readFuncType(reader))
  )
}

// commonly used for passing callbacks for partial application
type GenResult<T> = () => Result<T>

export const readFuncType = (reader: ByteReader): GenResult<TypeFunc> => () => {
  let tf = {} as TypeFunc
  return reader.readByte().chainK(
    (magic: number) => {
      return magic === 0x60
        ? Result.Ok
        : Result.throw('Magic header value (0x60) not found while reading FuncType')
    },
    () => readUint(reader),
    (numParams: number) => collectN<ValType>(numParams, readValType(reader)),
    (params) => {
      tf.params = params
      return readUint(reader)
    },
    (numResults: number) => collectN<ValType>(numResults, readValType(reader)),
    (results) => {
      tf.results = results
      return Result.from(tf)
    }
  )
}

export const readValType = (reader: ByteReader): GenResult<ValType> => () => {
  const byte = reader.readByte()
  if (byte.isErr) return Result.throw('Insufficient bytes reading ValType')
  if (!ValType[byte.unwrap()]) return Result.throw('Unknown ValType')
  return byte
}

// Function Section associates the Code section with the Type section
export const readFunctionSection = (bytes: number[]): Result<number[]> => {
  const reader = ByteReader.from(bytes)
  return readUint(reader).chainK(
    (numFuncIdx: number) => reader.readExact(numFuncIdx)
  )
}


export interface Local {
  count: number,
  type: ValType,
}

export interface CodeEntry {
  locals: Local[]
  code: OpCode[]
}

export const readCodeSection = (bytes: number[]): Result<CodeEntry[]> => {
  const reader = ByteReader.from(bytes)
  return readUint(reader).chainK(
    (numEntries: number) => collectN<CodeEntry>(numEntries, readCodeEntry(reader))
  )
}


export const readCodeEntry = (reader: ByteReader): GenResult<CodeEntry> => () => {
  let entry = {} as CodeEntry
  let codeReader: ByteReader
  return readUint(reader).chainK(
    (numBytes: number) => reader.readExact(numBytes),
    (bytes: number[]) => Result.from(ByteReader.from(bytes)),
    (_codeReader: ByteReader) => {
      codeReader = _codeReader
      return readUint(codeReader)
    },
    (numLocals: number) => collectN<Local>(numLocals, readLocal(codeReader)),
    (locals: Local[]) => {
      entry.locals = locals
      // It is difficult to determine the size of the `expr` part of the function
      // but we know it is the last thing remaining in the `codeReader` so we will
      // just use a big number to read all available bytes.
      return codeReader.read(0xFFFF)
    },
    ({ bytes }) => {
      const opReader = ByteReader.from(bytes)
      let ops = []
      while (opReader.hasNext()) {
        ops.push(readOpCode(opReader))
      }
      return Result.transposeArray<OpCode>(ops)
    },
    (ops: OpCode[]) => {
      entry.code = ops
      return Result.from(entry)
    }
  )
}

export const opsWithU32 = [
  Op.br,
  Op.brIf,
  Op.call,
  Op.localGet,
  Op.localSet,
  Op.localTee,
  Op.globalGet,
  Op.globalSet,
]

export const loadOps = [
  Op.i32Load, Op.i64Load, Op.f32Load, Op.f64Load,
  Op.i32Load8s, Op.i32Load8u, Op.i32Load16s, Op.i32Load16u,
  Op.i64Load8s, Op.i64Load8u, Op.i64Load16s, Op.i64Load16u,
  Op.i64Load32s, Op.i64Load32u,
]

export const memResizeOps = [Op.memoryGrow, Op.memorySize]

export const readOpCode = (reader: ByteReader): Result<OpCode> => {
  let entry = {} as OpCode

  return reader.readByte().chainK(
    (op: number) => {
      entry.code = op
      if (opsWithU32.includes(op)) {
        const u32 = reader.readByte()
        if (u32.isErr) return Result.throw('Unexpected EOF reading op-codes')
        entry.params = u32.unwrap()
      }
      if (memResizeOps.includes(op)) {
        // memory.size and memory.grow have a 0x00 that we just throw away
        const u32 = reader.readByte()
        if (u32.isErr) return Result.throw('Unexpected EOF reading op-codes')
      }
      if ([...loadOps].includes(op)) {
        const memArg = readMemArg(reader)
        if (memArg.isErr) return Result.throw('Unexpected EOF reading memory op code')
        entry.params = memArg
      }
      return Result.from(entry)
    }
  )
}

export interface MemArg {
  offset: number
  align: number
}
const readMemArg = (reader: ByteReader): Result<MemArg> => {
  let memArg = {} as MemArg
  return readUint(reader).chainK(
    (offset: number) => {
      memArg.offset = offset
      return readUint(reader)
    },
    (align: number) => {
      memArg.align = align
      return Result.from(memArg)
    }
  )
}

const readLocal = (reader: ByteReader): GenResult<Local> => () => {
  let local = {} as Local
  // TODO: I might want to expand out the count.
  // The 'n' (u32) represents how many times the valtype should be repeated.
  // locals ::= n:u32 t:valtype
  return readUint(reader).chainK(
    (count: number) => {
      local.count = count
      return reader.readByte()
    },
    (type: ValType) => {
      local.type = type
      return Result.from(local)
    }
  )
}

export interface ExportEntry {
  name: string
  desc: ExportDesc
  index: number
}

export const readExportSection = (bytes: number[]): Result<ExportEntry[]> => {
  const reader = ByteReader.from(bytes)
  return readUint(reader).chainK(
    (numExports: number) => collectN<ExportEntry>(numExports, readExport(reader)),
  )
}

export const readExport = (reader: ByteReader): GenResult<ExportEntry> => () => {
  let entry = {} as ExportEntry
  return readString(reader).chainK(
    (name: string) => {
      entry.name = name
      return reader.readByte()
    },
    (desc: ExportDesc) => {
      entry.desc = desc
      return readUint(reader)
    },
    (index: number) => {
      entry.index = index
      return Result.from(entry)
    }
  )
}