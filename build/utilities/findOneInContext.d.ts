import { SpinalContext, SpinalNode } from 'spinal-model-graph';
declare function findOneInContext(node: SpinalNode<any>, context: SpinalContext<any>, predicate: (node: SpinalNode<any>) => boolean): Promise<SpinalNode<any>>;
export { findOneInContext };
