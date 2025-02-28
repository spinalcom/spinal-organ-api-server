import { ISpinalAPIMiddleware } from '../interfaces';
import { SpinalNode } from 'spinal-env-viewer-graph-service';
declare function getFloorInventory(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, groupContext: SpinalNode<any>, dynamicId: number, reqInfo: {
    context: string;
    category: string;
    includePosition?: boolean;
    includeArea?: boolean;
    onlyDynamicId?: boolean;
}): Promise<any[]>;
export { getFloorInventory };
export default getFloorInventory;
