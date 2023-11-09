import { ISpinalAPIMiddleware } from '../interfaces';
declare function getEventListInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number): Promise<any[]>;
export { getEventListInfo };
export default getEventListInfo;
