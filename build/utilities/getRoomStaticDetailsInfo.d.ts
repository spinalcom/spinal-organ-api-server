import { ISpinalAPIMiddleware } from '../interfaces';
interface IEquipmentInfo {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    bimFileId: any;
    version: any;
    externalId: any;
    dbid: any;
    default_attributs: {
        revitCategory: string;
        revitFamily: string;
        revitType: string;
    };
}
interface IRoomAttr {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    attributs: any;
}
interface INodeControlEndpoint {
    profileName: any;
    endpoints: {
        dynamicId: number;
        staticId: any;
        name: any;
        category: string;
    }[];
}
interface INodeInfo {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
}
declare function getRoomStaticDetailsInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, roomId: number): Promise<{
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    attributsList: IRoomAttr[];
    controlEndpoint: INodeControlEndpoint[];
    endpoints: {
        dynamicId: number;
        staticId: string;
        name: string;
        type: string;
        value: any;
    }[];
    bimObjects: IEquipmentInfo[];
    groupParents: INodeInfo[];
}>;
export { getRoomStaticDetailsInfo };
export default getRoomStaticDetailsInfo;
