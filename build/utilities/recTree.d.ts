import { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { ContextTree } from '../routes/contexts/interfacesContexts';
declare function recTree(node: SpinalNode<any>, context?: SpinalContext<any>): Promise<ContextTree[]>;
declare function recTreeDepth(node: SpinalNode<any>, context: SpinalContext<any>, depth: number): Promise<ContextTree[]>;
export { recTree, recTreeDepth };
