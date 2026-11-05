import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
export type TRoomNodeWithParent = {
    node: SpinalNode;
    parentId: number;
};
export interface IFindRoomNodesOptions {
    spinalAPIMiddleware: ISpinalAPIMiddleware;
    profileId: string;
    geographicContext: SpinalContext;
    building: SpinalNode | undefined;
    parentDynamicIds?: number[];
}
/**
 * Returns an array when parents are supplied (so the caller can compute `total`),
 * otherwise a lazy iterable over the building's rooms.
 */
export declare function findRoomNodes({ spinalAPIMiddleware, profileId, geographicContext, building, parentDynamicIds, }: IFindRoomNodesOptions): Promise<Iterable<TRoomNodeWithParent> | AsyncIterable<TRoomNodeWithParent>>;
