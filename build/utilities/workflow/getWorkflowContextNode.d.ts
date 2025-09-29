import type { ISpinalAPIMiddleware } from '../../interfaces/ISpinalAPIMiddleware';
import { SpinalContext } from 'spinal-model-graph';
export declare function getWorkflowContextNode(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, workflowServerId: string): Promise<SpinalContext>;
