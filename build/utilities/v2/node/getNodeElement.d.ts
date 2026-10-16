import { Model } from 'spinal-core-connectorjs';
import { SpinalNode } from 'spinal-model-graph';
import type { ElementJson } from '../../../routes/v2/openApiCompo/schemas/INodeItem';
export type { ElementJson } from '../../../routes/v2/openApiCompo/schemas/INodeItem';
export type ElementQuery = false | true | string[][];
export declare function parseElementQuery(query?: string): ElementQuery;
export declare function getNodeElement(node: SpinalNode, query: ElementQuery): Promise<ElementJson | undefined>;
export declare function serializeModel(element: Model, query: true | string[][]): ElementJson | undefined;
