import type { ISpinalAPIMiddleware } from '../../interfaces/ISpinalAPIMiddleware';
declare function getTicketEntityInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, ticketId: number): Promise<{
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
}>;
export { getTicketEntityInfo };
export default getTicketEntityInfo;
