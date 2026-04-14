import type { BasicNodeExtended } from './BasicNodeExtended';
/**
 * @swagger
 * components:
 *   schemas:
 *     IUserGroup:
 *       type: "object"
 *       required:
 *         - dynamicId
 *         - staticId
 *         - name
 *         - type
 *         - color
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
 */
export type IUserGroup = BasicNodeExtended<['color']>;
