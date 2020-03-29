import { header, SectionId, ValType } from './wasm'
import { equals } from 'ramda'
import { collectN, iota } from '../util'
import ByteReader from './ByteReader'
import Result from '../fp/Result'

export const decodeU32 = (bytes: number[]) => {
  const num =
    bytes[0] +
    (bytes[1] << 8) +
    (bytes[2] << 16) +
    (bytes[3] << 24)
  return num
}

export const decodeWasm = (bytes: Uint8Array) => {
  const reader = new ByteReader(bytes)

  return Result.pipeK(
    (_header: number[]) => {
      if (!equals(Array.from(_header), header)) return Result.throw('Invalid header')
      return Result.any // value could be anything, we ignore it in the next step
    },
    () => reader.readExact(4),
    bytes => Result.from(decodeU32(bytes)),
    version => Result.from({ version })
  )(reader.readExact(4))
}

type SectionContent = any

export const readSection = (reader: ByteReader) => {
  let section:any = {}

  // The WASM binary doesn't provide a total size to expect at the beginning of
  // the file so we have no choice but to try to read and if there are
  // no more bytes for a section then it is the end of the file.
  const initial = reader.readByte()
  if (initial.isErr) return Result.none

  const sectionDecoders = {
    [SectionId.Custom]:   unimplemented,
    [SectionId.Type]:     readTypeSection,
    [SectionId.Import]:   unimplemented,
    [SectionId.Function]: unimplemented,
    [SectionId.Table]:    unimplemented,
    [SectionId.Memory]:   unimplemented,
    [SectionId.Global]:   unimplemented,
    [SectionId.Export]:   unimplemented,
    [SectionId.Start]:    unimplemented,
    [SectionId.Element]:  unimplemented,
    [SectionId.Code]:     unimplemented,
    [SectionId.Data]:     unimplemented,
  }

  return Result.pipeK(
    (id: number) => {
      section.id = id
      return Result.any
    },
    () => {
      const contentSize = readUint(reader)
      if (contentSize.isErr) return contentSize
      return reader.readExact(contentSize.unwrap())
    },
    (bytes: number[]) => {
      const id: SectionId = section.id
      const decoder: ((bytes: number[]) => Result<SectionContent>) = sectionDecoders[id]
      return decoder(bytes)
    },
    (content) => {
      return Result.from({ ...section, content })
    }
  )(initial)
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

export const unimplemented = (bytes: number[]) => Result.any

interface TypeFunc {
  params: ValType[],
  results: ValType[],
}

export const readTypeSection = (bytes: number[]): Result<TypeFunc[]> => {
  const reader = ByteReader.from(bytes)
  const numParams = readUint(reader)
  if (numParams.isErr) return Result.throw('Insufficient bytes reading type section')
  const typeFuncs = collectN<TypeFunc>(numParams.unwrap(), readFuncType(reader))
  return Result.transposeArray<TypeFunc>(typeFuncs)
}

export const readFuncType = (reader: ByteReader): (() => Result<TypeFunc>) => () => {
  let tf: TypeFunc = {
    params: [],
    results: []
  }

  return Result.pipeK(
    (magic: number) => {
      return magic === 0x60
        ? Result.any
        : Result.throw('Magic header value (0x60) not found while reading FuncType')
    },
    () => readUint(reader),
    (numParams: number) => {
      const params = collectN<ValType>(numParams, readValType(reader))
      return Result.transposeArray<ValType>(params)
    },
    (params) => {
      tf.params = params
      return readUint(reader)
    },
    (numResults: number) => {
      const results = collectN<ValType>(numResults, readValType(reader))
      return Result.transposeArray<ValType>(results)
    },
    (results) => {
      tf.results = results
      return Result.from(tf)
    }
  )(reader.readByte())
}

type GenResult<T> = () => Result<T>
export const readValType = (reader: ByteReader): GenResult<ValType> => () => {
  const byte = reader.readByte()
  if (byte.isErr) return Result.throw('Insufficient bytes reading ValType')
  if (!ValType[byte.unwrap()]) return Result.throw('Unknown ValType')
  return byte
}