import { ISpinalAPIMiddleware } from '../../interfaces';
/**
 * @interface IViewInfoBody
 */
export interface IViewInfoBody {
    /**
     * node root of the request
     * @type {(number[] | number)}
     * @memberof IViewInfoBody
     */
    dynamicId?: number | number[];
    /**
     * get infos from the floors references : floors, walls, windows, doors...
     * Default to false
     * @type {boolean}
     * @memberof IViewInfoBody
     */
    floorRef?: boolean;
    /**
     * get infos from the rooms references : floor(s)
     * Default to true
     * @type {boolean}
     * @memberof IViewInfoBody
     */
    roomRef?: boolean;
    /**
     * get infos from the equipements
     * Default to false
     * @type {boolean}
     * @memberof IViewInfoBody
     */
    equipements?: boolean;
}
export interface IViewInfoRes {
    dynamicId: number;
    data: IViewInfoItemRes[];
}
interface IViewInfoItemRes {
    bimFileId: string;
    dbIds: number[];
    dynamicIds: number[];
}
export declare function viewInfo_func(spinalAPIMiddleware: ISpinalAPIMiddleware, profilId: string, options?: IViewInfoBody | object, progressCallBack?: (totalVisited: number) => void): Promise<{
    code: number;
    dataType: 'text';
    data: string;
} | {
    code: number;
    dataType: 'json';
    data: any;
}>;
export {};
