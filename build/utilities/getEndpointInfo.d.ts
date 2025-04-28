import { ISpinalAPIMiddleware } from '../interfaces';
import { EndPointNode } from '../routes/nodes/interfacesNodes';
declare function getEndpointsInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profilId: string, dynamicId: number): Promise<EndPointNode[] | undefined>;
declare function getEndpointsInfoFormat2(spinalAPIMiddleware: ISpinalAPIMiddleware, profilId: string, dynamicId: number): Promise<EndPointNode[] | undefined>;
export { getEndpointsInfo, getEndpointsInfoFormat2 };
export default getEndpointsInfo;
