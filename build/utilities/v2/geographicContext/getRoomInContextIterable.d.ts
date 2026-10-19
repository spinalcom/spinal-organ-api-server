import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
export declare function getRoomInContextIterable(geographicContext: SpinalContext, buildingNode: SpinalNode): AsyncGenerator<{
    node: SpinalNode<any>;
    parentId: number;
}, void, unknown>;
