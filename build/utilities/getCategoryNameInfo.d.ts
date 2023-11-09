import { ISpinalAPIMiddleware } from '../interfaces';
declare function getCategoryNameInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number, categoryName: string): Promise<{
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
}>;
declare function getCategoryNamesInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number, categoryNames: string[]): Promise<any[]>;
export { getCategoryNameInfo, getCategoryNamesInfo };
