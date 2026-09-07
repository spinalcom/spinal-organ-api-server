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
    color: string;
    groups?: IUserGroup[];
    organizations?: IOrganization[];
    attributes?: Record<string, string>;
}
