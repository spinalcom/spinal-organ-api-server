import { ISpinalAPIMiddleware } from '../interfaces';
declare function getRoomReferenceObjectsListInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number): Promise<{
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    bimFileId: string;
    infoReferencesObjects: any[];
}>;
export { getRoomReferenceObjectsListInfo };
export default getRoomReferenceObjectsListInfo;
