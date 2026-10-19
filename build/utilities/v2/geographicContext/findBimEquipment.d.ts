import { SpinalNode } from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
export declare function findBimEquipment(middleware: ISpinalAPIMiddleware, profileId: string, bimFileId: string, dbid: number): Promise<{
    bimFile: SpinalNode;
    bimContext: SpinalNode | undefined;
    equipment: SpinalNode | undefined;
}>;
