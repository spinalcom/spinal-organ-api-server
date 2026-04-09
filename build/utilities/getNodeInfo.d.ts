import type { ISpinalAPIMiddleware } from '../interfaces';
import type { Node } from '../routes/interface/Node';
declare function getNodeInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number, includeChildrenRelations?: boolean, includeParentRelations?: boolean): Promise<Node | undefined>;
export { getNodeInfo };
export default getNodeInfo;
