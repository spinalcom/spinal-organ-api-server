import { ISpinalAPIMiddleware } from '../interfaces';
declare function getTicketListInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number, includeAttachedItems?: boolean): Promise<any[]>;
export { getTicketListInfo };
export default getTicketListInfo;
