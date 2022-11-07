import { RelationSearch, SpinalNode } from 'spinal-model-graph';
declare type NodeType = string;
export declare type TRelationMap = Record<NodeType, RelationSearch>;
export declare function visitNodesWithTypeRelation(root: SpinalNode, relationMap: TRelationMap): AsyncGenerator<SpinalNode<any>, void, void>;
export {};
