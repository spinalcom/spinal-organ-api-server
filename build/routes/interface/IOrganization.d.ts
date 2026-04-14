import type { BasicNodeExtended } from './BasicNodeExtended';
/**
 * @swagger
 * components:
 *   schemas:
 *     IOrganization:
 *       type: "object"
 *       required:
 *         - dynamicId
 *         - staticId
 *         - name
 *         - type
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         staticId:
 *           type: "string"
 *         name:
 *           type: "string"
 *         type:
 *           type: "string"
 *         color:
 *           type: "string"
 *         userGroupId:
 *           type: "string"
 */
export type IOrganization = BasicNodeExtended<['color', 'userGroupId']>;
