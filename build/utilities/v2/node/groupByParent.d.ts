export interface IParentGroup<T> {
    parentDynamicId: number;
    data: T[];
}
/**
 * Groups already-paginated items by the parent they were found under.
 * Groups keep the order in which their parents first appear in `page`, and
 * parents with no item in the page are omitted.
 */
export declare function groupPageByParent<T>(page: {
    parentId: number;
}[], items: T[]): IParentGroup<T>[];
