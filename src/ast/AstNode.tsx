export enum AstNodeType {
  Add,
  Subtract,
  Multiply,
  Divide,
  Power,
  Eq,
  NotEqual,
  Show,
  Bool,
  Int,
  Float,
  Var,
}

export interface AstNode {
  type: AstNodeType
  value: any
  children: AstNode[]
}

const identity = x => x

export const IntNode = n => ({ type: AstNodeType.Int, value: n, children: [] })
export const FloatNode = n => ({ type: AstNodeType.Float, value: n, children: [] })

// When operating in RPN mode, the children are not specified.
export const AddNode = (left, right) => ({ type: AstNodeType.Add, children: [left, right] })

const evalFns = {
  [AstNodeType.Add]:
    (node: AstNode) => {
      const left = evalNode(node.children[0])
      const right = evalNode(node.children[1])
      return {
        type: left.type,
        value: left.value + right.value,
        children: []
      }
    },

  [AstNodeType.Subtract]:
    (node: AstNode) => {
      const left = evalNode(node.children[0])
      const right = evalNode(node.children[1])
      return {
        type: left.type,
        value: left.value - right.value,
        children: []
      }
    },

  [AstNodeType.Multiply]:
    (node: AstNode) => {
      const left = evalNode(node.children[0])
      const right = evalNode(node.children[1])
      return {
        type: left.type,
        value: left.value * right.value,
        children: []
      }
    },

  [AstNodeType.Divide]:
    (node: AstNode) => {
      const left = evalNode(node.children[0])
      const right = evalNode(node.children[1])
      return {
        type: left.type,
        value: left.value / right.value,
        children: []
      }
    },
  
  [AstNodeType.Bool]: identity,
  [AstNodeType.Int]: identity,
  [AstNodeType.Float]: identity,
}

export const evalNode = (node: AstNode) => {
  const fn = evalFns[node.type]
  if (fn === undefined) {
    console.error(`No eval function for type ${AstNodeType[node.type]}`)
    return
  }
  return fn(node)
}