import { header } from '../wasm'
export const version = [1, 0, 0, 0]

export const preamble = [
  ...header,
  ...version
]

export const typeSection = [
  0x01, 0x07, 0x01, 0x60, // type section
  0x02, 0x7F, 0x7F, // 2 params (i32, i32)
  0x01, 0x7F, // 1 result (i32)
]

export const functionSection = [
  0x03, 0x02, // function section (0x03), contents(0x02 bytes)
  0x01, 0x00, // vector(size=1) [type $0]
]

export const exportSection = [
  0x07, 0x07, // export section (0x07), contents(0x07 bytes)
  0x01, 0x03, 0x61, 0x64, 0x64, // vector(size=1) str='add'
  0x00, 0x00, // funcidx 0
]

export const codeSection = [
  0x0A, 0x09, // code section (0x0A), contents(9 bytes)
  1, 7, // 1 code entry, contents (7 bytes)
  0, // vec(locals) with 0 locals defined in func

  0x20, 0, // local.get 0
  0x20, 1, // local.get 1
  0x6A, // i32.add
  0x0B, // end
]

export const adderBytes = [
  ...preamble,
  ...typeSection,
  ...functionSection,
  ...exportSection,
  ...codeSection,
]