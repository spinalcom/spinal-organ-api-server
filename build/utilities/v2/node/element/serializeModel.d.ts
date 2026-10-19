import { Model } from 'spinal-core-connectorjs';
import type { ElementJson } from '../../../../routes/v2/openApiCompo/schemas/INodeItem';
export declare function serializeModel(element: Model, query: true | string[][]): ElementJson | undefined;
