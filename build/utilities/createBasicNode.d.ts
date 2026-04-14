import type { SpinalNode } from 'spinal-model-graph';
import type { BasicNode } from '../routes/interface/BasicNode';
import type { BasicNodeExtended } from '../routes/interface/BasicNodeExtended';
export declare function createBasicNodeSync(node: SpinalNode): Promise<BasicNode>;
export declare function createBasicNodeSync<Attr extends string[]>(node: SpinalNode, attrToAdd: Attr): Promise<BasicNodeExtended<Attr>>;
export declare function createBasicNode(node: SpinalNode): BasicNode;
export declare function createBasicNode<Attr extends string[]>(node: SpinalNode, attrToAdd: Attr): BasicNodeExtended<Attr>;
