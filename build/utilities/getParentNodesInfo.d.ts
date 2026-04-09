import type { ISpinalAPIMiddleware } from '../interfaces';
import type { BasicNode } from '../routes/interface/BasicNode';
declare function getParentNodesInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number, relations?: string[], contextId?: number): Promise<BasicNode[]>;
export { getParentNodesInfo };
export default getParentNodesInfo;
