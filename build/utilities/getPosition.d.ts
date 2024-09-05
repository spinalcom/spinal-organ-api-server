import { ISpinalAPIMiddleware } from '../interfaces';
export declare function getEquipmentPosition(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, spatialContextId: string, dynamicId: number): Promise<{
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    info: {
        context: {
            dynamicId: any;
            staticId: any;
            name: any;
            type: any;
        };
        building: {
            dynamicId: any;
            staticId: any;
            name: any;
            type: any;
        };
        floor: {
            dynamicId: any;
            staticId: any;
            name: any;
            type: any;
        };
        room: {
            dynamicId: any;
            staticId: any;
            name: any;
            type: any;
        };
    };
}>;
export declare function getRoomPosition(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, spatialContextId: string, dynamicId: number): Promise<{
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    info: {
        context: {
            dynamicId: number;
            staticId: string;
            name: string;
            type: string;
        };
        building: {
            dynamicId: number;
            staticId: string;
            name: string;
            type: string;
        };
        floor: {
            dynamicId: number;
            staticId: string;
            name: string;
            type: string;
        };
    };
}>;
