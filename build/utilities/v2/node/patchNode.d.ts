import { SpinalNode } from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import type { Patch } from './patch/schema';
export { patchNodeSchema } from './patch/schema';
export declare function patchNode(node: SpinalNode, patch: Patch, middleware: ISpinalAPIMiddleware, profileId: string): Promise<void>;
