import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
export declare function getEquipmentInContextIterable(geographicContext: SpinalContext, buildingNode: SpinalNode, bimObjectType: 'bimobject' | 'referenceRoom' | 'referenceFloor'): AsyncGenerator<{
    node: SpinalNode<any>;
    parentId: number;
}, void, unknown>;
