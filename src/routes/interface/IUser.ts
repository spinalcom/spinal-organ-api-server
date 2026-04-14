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

import type { IOrganization } from './IOrganization';
import type { IUserGroup } from './IUserGroup';

/**
 * @swagger
 * components:
 *   schemas:
 *     IUser:
 *       type: "object"
 *       required:
 *         - dynamicId
 *         - staticId
 *         - email
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         staticId:
 *           type: "string"
 *         email:
 *           type: "string"
 *         groups:
 *           type: "array"
 *           items:
 *             $ref: "#/components/schemas/IUserGroup"
 *         organizations:
 *           type: "array"
 *           items:
 *             $ref: "#/components/schemas/IOrganization"
 *         attributes:
 *           type: "object"
 *           additionalProperties:
 *             type: "string"
 *             description: "A key-value pair object representing user attributes, where the key is the attribute name and the value is the attribute value."
 *       example:
 *         dynamicId: 12345
 *         staticId: "user-12345"
 *         email: "user@example.com"
 *         groups:
 *           - dynamicId: 1
 *             staticId: "group-1"
 *             name: "Group 1"
 *             type: "SpinalUserGroup"
 *             color: "red"
 *         organizations:
 *           - dynamicId: 1
 *             staticId: "org-1"
 *             name: "Organization 1"
 *             type: "Organization"
 *             color: "blue"
 *         attributes:
 *           name: "John"
 *           lastname: "Doe"

 */
export interface IUser {
  dynamicId: number;
  staticId: string;
  email: string;
  groups?: IUserGroup[];
  organizations?: IOrganization[];
  attributes?: Record<string, string>;
}
