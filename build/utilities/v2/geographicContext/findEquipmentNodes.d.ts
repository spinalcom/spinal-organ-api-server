import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
export type TBimObjectType = 'bimobject' | 'referenceRoom' | 'referenceFloor';
export type TNodeWithParent = {
    node: SpinalNode;
    parentId: number;
};
export interface IFindEquipmentNodesOptions {
    spinalAPIMiddleware: ISpinalAPIMiddleware;
    profileId: string;
    geographicContext: SpinalContext;
    building: SpinalNode | undefined;
    bimObjectType: TBimObjectType;
    parentDynamicIds?: number[];
}
/**
 * Returns an array when parents are supplied (so the caller can compute `total`),
 * otherwise a lazy iterable over the whole building.
 */
export declare function findEquipmentNodes({ spinalAPIMiddleware, profileId, geographicContext, building, bimObjectType, parentDynamicIds, }: IFindEquipmentNodesOptions): Promise<Iterable<TNodeWithParent> | AsyncIterable<TNodeWithParent>>;
