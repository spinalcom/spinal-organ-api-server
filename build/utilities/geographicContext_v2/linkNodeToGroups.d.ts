import type { SpinalNode } from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../../interfaces';
export declare function linkNodeToGroups(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, node: SpinalNode, groups: {
    contextDynamicId: number;
    groupDynamicId: number;
}[]): Promise<{
    success: {
        contextDynamicId: number;
        groupDynamicId: number;
    }[];
    errors: {
        contextDynamicId: number;
        groupDynamicId: number;
    }[];
}>;
