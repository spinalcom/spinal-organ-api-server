import type { ISpinalAPIMiddleware } from '../../interfaces/ISpinalAPIMiddleware';
declare function getTicketDetails(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, ticketId: number, includeAttachedItems?: boolean): Promise<{
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    priority: number;
    creationDate: number;
    elementSelected: string | {
        dynamicId: any;
        staticId: any;
        name: any;
        type: any;
    };
    process: string | {
        dynamicId: number;
        staticId: string;
        name: string;
        type: string;
    };
    step: string | {
        dynamicId: number;
        staticId: string;
        name: string;
        type: string;
        color: any;
        order: any;
    };
    workflowId: number;
    workflowName: string;
}>;
export { getTicketDetails };
export default getTicketDetails;
