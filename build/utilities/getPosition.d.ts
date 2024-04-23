import { ISpinalAPIMiddleware } from '../interfaces';
export declare function getEquipmentPosition(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, spatialContextId: string, dynamicId: number): Promise<{
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
        room: {
            dynamicId: number;
            staticId: string;
            name: string;
            type: string;
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
