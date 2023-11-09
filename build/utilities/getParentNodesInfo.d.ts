import { ISpinalAPIMiddleware } from '../interfaces';
import { BasicNode } from '../routes/nodes/interfacesNodes';
declare function getParentNodesInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number, relations?: string[]): Promise<BasicNode[]>;
export { getParentNodesInfo };
export default getParentNodesInfo;
