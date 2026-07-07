import type { ISpinalAPIMiddleware } from "../../interfaces/ISpinalAPIMiddleware";
declare function getTicketDetails(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, ticketId: number, includeAttachedItems?: boolean): Promise<Record<string, any>>;
export { getTicketDetails };
export default getTicketDetails;
