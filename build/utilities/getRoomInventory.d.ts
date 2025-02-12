import { ISpinalAPIMiddleware } from '../interfaces';
declare function getRoomInventory(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number): Promise<{
    dynamicId: number;
    staticId: string;
    type: string;
    name: string;
    color: any;
    inventories: any[];
}>;
export { getRoomInventory };
export default getRoomInventory;
