import type { ISpinalAPIMiddleware } from '../../interfaces/ISpinalAPIMiddleware';
declare function getTicketDetails(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, ticketId: number): Promise<{
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    priority: number;
    creationDate: number;
    description: string;
    declarer_id: string;
    elementSelected: string | {
        dynamicId: number;
        staticId: string;
        name: string;
        type: string;
    };
    userName: string;
    gmaoId: string;
    gmaoDateCreation: string;
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
    annotation_list: any[];
    file_list: any[];
    log_list: {
        userName: any;
        date: any;
        event: string;
        ticketStaticId: string;
    }[];
}>;
export { getTicketDetails };
export default getTicketDetails;
