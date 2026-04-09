import type { SpinalNode } from 'spinal-model-graph';
import type { Relation } from '../routes/interface/Relation';
declare function childrensNode(node: SpinalNode<any>): Relation[];
declare function parentsNode(node: SpinalNode<any>): Promise<Relation[]>;
export { childrensNode, parentsNode };
