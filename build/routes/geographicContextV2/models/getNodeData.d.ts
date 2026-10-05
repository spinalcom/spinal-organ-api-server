import { SpinalNode } from 'spinal-model-graph';
import type { INodeItem } from './INodeItem';
export declare function getNodeData(node: SpinalNode, info: true | string[], attr: Record<string, string[] | boolean> | boolean, addAttributesModificationDate?: boolean): Promise<INodeItem>;
