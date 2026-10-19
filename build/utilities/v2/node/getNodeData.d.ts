import { SpinalNode } from 'spinal-model-graph';
import type { INodeItem } from '../../../routes/v2/openApiCompo/schemas/INodeItem';
import type { INodeItemAttr } from '../../../routes/v2/openApiCompo/schemas/INodeItemAttr';
import type { INodeItemInfo } from '../../../routes/v2/openApiCompo/schemas/INodeItemInfo';
import { type ElementQuery } from './getNodeElement';
export declare function getNodeData(node: SpinalNode, info: true | string[], attr: Record<string, string[] | boolean> | boolean, addAttributesModificationDate?: boolean, parentDynamicId?: number, parsedElementQuery?: ElementQuery): Promise<INodeItem>;
export declare function extractNodeInfo(infoQuery: true | string[], node: SpinalNode<any>): INodeItemInfo;
export declare function extractNodeAttr(node: SpinalNode, attrQuery: boolean | Record<string, string[] | boolean> | undefined, addAttributesModificationDate: boolean): Promise<INodeItemAttr | undefined>;
