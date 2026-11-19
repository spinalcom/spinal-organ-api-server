import type { SpinalNode } from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../interfaces';
declare function getControlEndpointsInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profilId: string, dynamicId: number, includeDetails?: boolean): Promise<{
    dynamicId: number;
    profileName: any;
    endpoints: {
        dynamicId: number;
        staticId: any;
        name: any;
        type: any;
        currentValue: any;
        unit: any;
        saveTimeSeries: any;
        hasTimeSeries: boolean;
        controlValue: any;
        timeseriesRetentionDays: any;
        lastUpdate: number;
    }[];
}[]>;
declare function getNodeControlEndpointsInfo(node: SpinalNode, includeDetails?: boolean): Promise<{
    dynamicId: number;
    profileName: any;
    endpoints: {
        dynamicId: number;
        staticId: any;
        name: any;
        type: any;
        currentValue: any;
        unit: any;
        saveTimeSeries: any;
        hasTimeSeries: boolean;
        controlValue: any;
        timeseriesRetentionDays: any;
        lastUpdate: number;
    }[];
}[]>;
export { getControlEndpointsInfo, getNodeControlEndpointsInfo };
export default getControlEndpointsInfo;
