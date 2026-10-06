import type { SpinalNode } from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import type { IErrorItem } from '../../../routes/v2/interface/IErrorItem';
export declare function linkNodeToGroups(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, node: SpinalNode, groups: {
    contextDynamicId: number;
    groupDynamicId: number;
}[]): Promise<{
    success: {
        contextDynamicId: number;
        groupDynamicId: number;
    }[];
    errors: IErrorItem[];
}>;
