import type { ISpinalAPIMiddleware } from '../interfaces';
import type { SpinalContext } from 'spinal-model-graph';
export declare function getSpatialContext(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string): Promise<SpinalContext>;
