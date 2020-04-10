import { FuncSpec, ModuleSpec } from './wasm'
import { encodeModule } from './encode'

export interface AddFunction {
  type: 'AddFunction'
  payload: FuncSpec
}

export type Command = AddFunction

// TODO: make this more granular to be an effective structured code editor

class WasmBuilder {
  spec: ModuleSpec

  constructor () {
    this.spec = {
      version: 1,
      types: [],
      functions: [],
    }
  }

  process (cmd: Command) {
    if (cmd.type === 'AddFunction') {
      this.spec.functions.push(cmd.payload)
    }
  }

  compile () {
    return encodeModule(this.spec)
  }

  getSpec () { return this.spec }
}

export default WasmBuilder