import type { NodeAttribut } from '../routes/interface/NodeAttribut';
import type { ISpinalAPIMiddleware } from '../interfaces';
declare function getAttributeListInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number): Promise<NodeAttribut[]>;
export { getAttributeListInfo };
export default getAttributeListInfo;
