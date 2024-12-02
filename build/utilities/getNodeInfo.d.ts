import { ISpinalAPIMiddleware } from '../interfaces';
import { Node } from '../routes/nodes/interfacesNodes';
declare function getNodeInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number, includeChildrenRelations?: boolean, includeParentRelations?: boolean): Promise<Node | undefined>;
export { getNodeInfo };
export default getNodeInfo;
