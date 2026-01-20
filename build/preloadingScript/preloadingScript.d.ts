import type { ISpinalAPIMiddleware } from '../interfaces/ISpinalAPIMiddleware';
export interface IPreloadingScript {
    runViewInfo: boolean;
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
}
export declare function preloadingScript(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, scriptOptions: IPreloadingScript): Promise<void>;
