import { ISpinalAPIMiddleware } from '../interfaces';
declare function getBuildingReferenceObjectsListInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string): Promise<{
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    infoReferencesObjects: any[];
}>;
export { getBuildingReferenceObjectsListInfo };
export default getBuildingReferenceObjectsListInfo;
