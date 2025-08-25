import type { ISpinalAPIMiddleware } from '../interfaces/ISpinalAPIMiddleware';
import { SpinalNode } from 'spinal-model-graph';
export declare function loadAndValidateNode(spinalAPIMiddleware: ISpinalAPIMiddleware, serverId: number, profileId: string, nodeType?: string): Promise<SpinalNode<any>>;
