import type { ISpinalAPIMiddleware } from '../../../interfaces';
import type { SpinalContext } from 'spinal-model-graph';
export interface IParentChildRelation {
    relationName: string;
    parentType: string;
    context?: SpinalContext;
}
export declare function getNodeChildrenFromParentDynId(spinalAPIMiddleware: ISpinalAPIMiddleware, parentDynamicId: number, profileId: string, childrenType: string, relations: IParentChildRelation[]): Promise<import("spinal-model-graph").SpinalNode<any>[]>;
