import { ISpinalAPIMiddleware } from '../interfaces';
declare function getRoomDetailsInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number): Promise<{
    area: number;
    bimFileId: string;
    _bimObjects: any[];
}>;
export { getRoomDetailsInfo };
export default getRoomDetailsInfo;
