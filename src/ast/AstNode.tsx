export enum AstNodeType {
  Op
}

export interface AstNode {
  type: AstNodeType
  value: any
  children: AstNode[]
}