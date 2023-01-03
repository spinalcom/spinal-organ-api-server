import type { SpinalNode } from 'spinal-model-graph';
import { ISpinalAPIMiddleware } from 'src/interfaces';
declare function getNode(spinalAPIMiddleware: ISpinalAPIMiddleware, dynamicId: string, staticId: string, profileId: string): Promise<SpinalNode | undefined>;
export default getNode;
