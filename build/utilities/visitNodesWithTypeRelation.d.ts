import { RelationSearch, SpinalNode } from 'spinal-model-graph';
type NodeType = string;
export type TRelationMap = Record<NodeType, RelationSearch>;
export declare function visitNodesWithTypeRelation(root: SpinalNode, relationMap: TRelationMap): AsyncGenerator<SpinalNode<any>, void, void>;
export {};
