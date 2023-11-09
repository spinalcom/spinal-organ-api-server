import type { NodeAttribut } from '../routes/attributs/interfacesAttributs';
import { ISpinalAPIMiddleware } from '../interfaces';
declare function getAttributeListInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number): Promise<NodeAttribut[]>;
export { getAttributeListInfo };
export default getAttributeListInfo;
