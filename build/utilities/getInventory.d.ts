import { ISpinalAPIMiddleware } from '../interfaces';
import { SpinalNode } from 'spinal-env-viewer-graph-service';
type InventoryRequestInfo = {
    context?: string;
    contextId?: number;
    category?: string;
    categoryId?: number;
    groups?: string[];
    groupIds?: number[];
    includePosition?: boolean;
    includeArea?: boolean;
    onlyDynamicId?: boolean;
};
declare function getRoomInventory(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, groupContext: SpinalNode<any>, dynamicId: number, reqInfo: InventoryRequestInfo): Promise<any[]>;
declare function getFloorInventory(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, groupContext: SpinalNode<any>, dynamicId: number, reqInfo: InventoryRequestInfo): Promise<any[]>;
export { getFloorInventory, getRoomInventory };
