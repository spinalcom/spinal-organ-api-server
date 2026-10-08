import { SpinalNode } from 'spinal-model-graph';
import type { INodeItem } from '../../../routes/v2/openApiCompo/schemas/INodeItem';
export declare function getNodeData(node: SpinalNode, info: true | string[], attr: Record<string, string[] | boolean> | boolean, addAttributesModificationDate?: boolean, parentDynamicId?: number): Promise<INodeItem>;
