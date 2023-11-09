import { ISpinalAPIMiddleware } from '../interfaces';
declare function getTicketDetails(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, ticketId: number): Promise<{
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    priority: any;
    creationDate: any;
    description: any;
    declarer_id: any;
    elementSelected: string | {
        dynamicId: number;
        staticId: string;
        name: string;
        type: string;
    };
    userName: any;
    gmaoId: any;
    gmaoDateCreation: any;
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
    log_list: any[];
}>;
export { getTicketDetails };
export default getTicketDetails;
