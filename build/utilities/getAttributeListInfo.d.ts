import type { NodeAttribut } from 'src/routes/interface/NodeAttribut';
import { ISpinalAPIMiddleware } from '../interfaces';
declare function getAttributeListInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number): Promise<NodeAttribut[]>;
export { getAttributeListInfo };
export default getAttributeListInfo;
