import type { IUser } from '../routes/interface/IUser';
import type { SpinalNode } from 'spinal-model-graph';
export declare function getUserData(userNode: SpinalNode, addAttributs?: boolean, addGroups?: boolean, addOrganizations?: boolean): Promise<IUser>;
