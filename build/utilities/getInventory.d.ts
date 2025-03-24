import { ISpinalAPIMiddleware } from '../interfaces';
import { SpinalNode } from 'spinal-env-viewer-graph-service';
declare function getRoomInventory(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, groupContext: SpinalNode<any>, dynamicId: number, reqInfo: {
    context: string;
    category: string;
    includePosition?: boolean;
    onlyDynamicId?: boolean;
}): Promise<any[]>;
declare function getFloorInventory(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, groupContext: SpinalNode<any>, dynamicId: number, reqInfo: {
    context: string;
    category: string;
    includePosition?: boolean;
    includeArea?: boolean;
    onlyDynamicId?: boolean;
}): Promise<any[]>;
export { getFloorInventory, getRoomInventory };
