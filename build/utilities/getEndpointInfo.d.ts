import { ISpinalAPIMiddleware } from '../interfaces';
import { EndPointNode } from '../routes/nodes/interfacesNodes';
declare function getEndpointsInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profilId: string, dynamicId: number): Promise<EndPointNode[] | undefined>;
export { getEndpointsInfo };
export default getEndpointsInfo;
