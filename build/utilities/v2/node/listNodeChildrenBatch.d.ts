import type { ISpinalAPIMiddleware } from '../../../interfaces';
export interface IBatchChildrenQuery {
    parentIds: number[];
    relationType?: 'PtrLst' | 'LstPtr' | 'Ref';
    relationNames?: string[];
    contextDynamicId?: number;
    info?: string;
    attributes?: string;
    element?: string;
    filter?: unknown;
    offset: number;
    addAttributesModificationDate?: boolean;
}
/**
 * Lists the distinct direct children of several parents in one page.
 * Each parent's children are deduplicated on their own, as in GET children.
 * Filters and `offset` apply to the combined sequence, and each item carries
 * the `parentDynamicId` it was found under.
 */
export declare function listNodeChildrenBatch(middleware: ISpinalAPIMiddleware, profileId: string, query: IBatchChildrenQuery): Promise<{
    data: import("../../../routes/v2/openApiCompo/schemas/INodeItem").INodeItem[];
    offset: number;
    total: number;
}>;
