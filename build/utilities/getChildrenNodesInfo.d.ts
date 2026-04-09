import type { ISpinalAPIMiddleware } from '../interfaces';
import type { BasicNode } from '../routes/interface/BasicNode';
declare function getChildrenNodesInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number, relations?: string[], contextId?: number): Promise<BasicNode[]>;
export { getChildrenNodesInfo };
export default getChildrenNodesInfo;
