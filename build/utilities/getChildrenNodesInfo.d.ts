import { ISpinalAPIMiddleware } from '../interfaces';
import { BasicNode } from '../routes/nodes/interfacesNodes';
declare function getChildrenNodesInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number, relations?: string[], contextId?: number): Promise<BasicNode[]>;
export { getChildrenNodesInfo };
export default getChildrenNodesInfo;
