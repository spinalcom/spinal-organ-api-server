import type { ISpinalAPIMiddleware } from '../interfaces/ISpinalAPIMiddleware';
/**
 * A floor inventory to preload : the inventory is run on every floor id, then,
 * when staticDetails is true, static details are preloaded for every item found.
 *
 * @export
 * @interface IInventoryPreload
 */
export interface IInventoryPreload {
    /** Floor dynamic ids (server_id) to run the inventory on */
    ids: number[];
    /** Group context name (ignored when contextId is provided) */
    context: string;
    /** Group context dynamic id (server_id) ; takes precedence over context */
    contextId?: number;
    /** Category name (ignored when categoryId is provided) */
    category: string;
    /** Category dynamic id (server_id) ; takes precedence over category */
    categoryId?: number;
    /** Group names to filter on (empty = every group of the category) */
    groups: string[];
    /** Group dynamic ids (server_id) ; take precedence over groups */
    groupIds?: number[];
    /** When true, preload static details + ticket lists of every item found */
    staticDetails: boolean;
}
export interface IPreloadingScript {
    /**
     * @type {number[]} array of server_id to preload the viewInfo of
     * @memberof IPreloadingScript
     */
    runViewInfo: number[];
    /**
     * @type {number[]} array of server_id to preload static details + ticket list details
     * @memberof IPreloadingScript
     */
    runStaticDetails: number[];
    /**
     * @type {number[]} array of server_id to preload ticket list details
     * @memberof IPreloadingScript
     */
    runTicketLists: number[];
    /**
     * @type {IInventoryPreload[]} array of floor inventories to preload
     * @memberof IPreloadingScript
     */
    inventories: IInventoryPreload[];
}
export declare function preloadingScript(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, scriptOptions: IPreloadingScript): Promise<void>;
