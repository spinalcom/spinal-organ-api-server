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
interface IAttr {
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
declare function getBuildingStaticDetailsInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, buildingId: number): Promise<{
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    attributsList: IAttr[];
    controlEndpoint: INodeControlEndpoint[];
    endpoints: {
        dynamicId: number;
        staticId: string;
        name: string;
        type: string;
        value: any;
    }[];
}>;
declare function getEquipmentStaticDetailsInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, equipementId: number): Promise<{
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
    attributsList: IAttr[];
    controlEndpoint: INodeControlEndpoint[];
    endpoints: {
        dynamicId: number;
        staticId: string;
        name: string;
        type: string;
        value: any;
    }[];
    groupParents: INodeInfo[];
}>;
declare function getFloorStaticDetailsInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, floorId: number): Promise<{
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    attributsList: IAttr[];
    controlEndpoint: INodeControlEndpoint[];
    endpoints: {
        dynamicId: number;
        staticId: string;
        name: string;
        type: string;
        value: any;
    }[];
}>;
declare function getRoomStaticDetailsInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, roomId: number): Promise<{
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    attributsList: IAttr[];
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
export { getEquipmentStaticDetailsInfo };
export { getRoomStaticDetailsInfo };
export { getFloorStaticDetailsInfo };
export { getBuildingStaticDetailsInfo };
