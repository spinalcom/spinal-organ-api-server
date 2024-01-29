import { ISpinalAPIMiddleware } from '../interfaces';
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
export { getEquipmentStaticDetailsInfo };
export default getEquipmentStaticDetailsInfo;