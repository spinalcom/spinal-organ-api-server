import type { ISpinalAPIMiddleware } from '../../../interfaces';
import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
export interface IParentChildRelation {
    relationName: string;
    parentType: string;
    context?: SpinalContext;
}
export declare function getNodeChildrenFromParentDynId(spinalAPIMiddleware: ISpinalAPIMiddleware, parentDynamicId: number, profileId: string, childrenType: string, relations: IParentChildRelation[]): Promise<SpinalNode<any>[]>;
export declare function getNodeChildrenFromParentDynIds(spinalAPIMiddleware: ISpinalAPIMiddleware, parentDynamicIds: number[], profileId: string, childrenType: string, relations: IParentChildRelation[]): Promise<{
    node: SpinalNode;
    parentId: number;
}[]>;
