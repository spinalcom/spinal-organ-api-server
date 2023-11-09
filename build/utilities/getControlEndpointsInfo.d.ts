import { ISpinalAPIMiddleware } from '../interfaces';
declare function getControlEndpointsInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profilId: string, dynamicId: number): Promise<{
    dynamicId: number;
    profileName: any;
    endpoints: {
        dynamicId: number;
        staticId: any;
        name: any;
        type: any;
        currentValue: any;
    }[];
}[]>;
export { getControlEndpointsInfo };
export default getControlEndpointsInfo;
