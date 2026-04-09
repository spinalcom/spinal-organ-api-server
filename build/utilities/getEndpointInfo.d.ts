import type { ISpinalAPIMiddleware } from '../interfaces';
import type { EndPointNode } from '../routes/interface/EndPointNode';
declare function getEndpointsInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profilId: string, dynamicId: number, includeDetails?: boolean): Promise<EndPointNode[] | undefined>;
declare function getEndpointsInfoFormat2(spinalAPIMiddleware: ISpinalAPIMiddleware, profilId: string, dynamicId: number): Promise<EndPointNode[] | undefined>;
export { getEndpointsInfo, getEndpointsInfoFormat2 };
export default getEndpointsInfo;
