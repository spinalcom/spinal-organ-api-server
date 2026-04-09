/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import type { BasicNode } from '../nodes/interfacesNodes';

export interface User {
  dynamicId: number;
  staticId: string;
  email: string;
  groups?: BasicNode[];
  organizations?: NodeWithParent[];
  attributes?: {
    // everything in category `User`
    [attributeLabel: string]: string;
  };
}
export interface UserCreateOrEdit {
  email: string;
  attributes?: {
    // everything will be added as attribute in the category `User`
    [attributeLabel: string]: string;
  };
}
export interface UserGetMultiple {
  dynamicIds: number[]; // array of user dynamic id
  attributes: boolean; // add attributes in the user; default = false
  groups: boolean;
  organizations: boolean;
}

export interface NodeWithParent extends BasicNode {
  parentDynamicId: number;
}
export interface CreateOrEditName {
  name: string;
}
export interface CreateOrEditNameAndColor {
  name: string;
  color: string; // hex color code
}
export interface MultipleDynIdBody {
  dynamicIds: number[]; // array of user dynamic id
}
export interface DynIdAndNameBody {
  dynamicId: number;
  name: string;
}
