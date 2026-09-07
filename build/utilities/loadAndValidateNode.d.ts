import type { ISpinalAPIMiddleware } from '../interfaces/ISpinalAPIMiddleware';
import { SpinalNode } from 'spinal-model-graph';
export declare function loadAndValidateNodeMultiple(spinalAPIMiddleware: ISpinalAPIMiddleware, serverIds: number[], profileId: string, nodeType?: string): Promise<{
    successful: SpinalNode[];
    failedServerIds: number[];
}>;
export declare function loadAndValidateNode(spinalAPIMiddleware: ISpinalAPIMiddleware, serverId: number, profileId: string, nodeType?: string): Promise<SpinalNode<any>>;
