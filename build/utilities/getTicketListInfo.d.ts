import { ISpinalAPIMiddleware } from '../interfaces';
declare function getTicketListInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number): Promise<any[]>;
export { getTicketListInfo };
export default getTicketListInfo;
