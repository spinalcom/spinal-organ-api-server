import { ISpinalAPIMiddleware } from '../interfaces';
import { SpinalNode } from 'spinal-env-viewer-graph-service';
export declare function getSpatialContext(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string): Promise<SpinalNode<any>>;
