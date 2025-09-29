import { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { ContextTree } from '../routes/contexts/interfacesContexts';
export declare function recTree(node: SpinalNode, context?: SpinalContext): Promise<ContextTree[]>;
export declare function recTreeDetails(node: SpinalNode, context?: SpinalContext): Promise<ContextTree[]>;
export declare function recTreeDepth(node: SpinalNode, context: SpinalContext, depth: number): Promise<ContextTree[]>;
