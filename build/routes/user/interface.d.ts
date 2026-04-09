import type { BasicNode } from '../interface/BasicNode';
export interface User {
    dynamicId: number;
    staticId: string;
    email: string;
    groups?: BasicNode[];
    organizations?: NodeWithParent[];
    attributes?: {
        [attributeLabel: string]: string;
    };
}
export interface UserCreateOrEdit {
    email: string;
    attributes?: {
        [attributeLabel: string]: string;
    };
}
export interface UserGetMultiple {
    dynamicIds: number[];
    attributes: boolean;
    groups: boolean;
    organizations: boolean;
}
export interface NodeWithColor {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    color: string;
}
export interface NodeWithParent {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    parentDynamicId: number;
}
export interface CreateOrEditName {
    name: string;
}
export interface CreateOrEditNameAndColor {
    name: string;
    color: string;
}
export interface MultipleDynIdBody {
    dynamicIds: number[];
}
export interface DynIdAndNameBody {
    dynamicId: number;
    name: string;
}
