import { ISpinalAPIMiddleware } from '../interfaces';
declare function getTicketEntityInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, ticketId: number): Promise<{
    dynamicId: number;
    staticId: any;
    name: any;
    type: any;
}>;
export { getTicketEntityInfo };
export default getTicketEntityInfo;
