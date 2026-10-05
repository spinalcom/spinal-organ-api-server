import type { ISpinalAPIMiddleware } from '../../interfaces';
import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
export declare function getBuildingNode(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, createContextIfNotFound?: boolean): Promise<{
    geographicContext: SpinalContext;
    building: SpinalNode | undefined;
}>;
