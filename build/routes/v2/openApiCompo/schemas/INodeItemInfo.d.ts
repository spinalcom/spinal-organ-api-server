import type { ElementJson } from './INodeItem';
/**
 * @swagger
 * components:
 *   schemas:
 *     INodeItemInfo:
 *       description: Information about the node item
 *       type: object
 *       properties:
 *         staticId:
 *           type: string
 *           description: Static ID of the node (unique id from the database)
 *         name:
 *           type: string
 *           description: Name of the node
 *         type:
 *           type: string
 *           description: Type of the node
 *         color:
 *           type: string
 *           description: Color of the node must be in hexadecimal format (e.g., #FFFFFF)
 *         directModificationDate:
 *           type: number
 *           description: Unix timestamp in milliseconds of the node's direct modification date.
 *       additionalProperties:
 *         oneOf:
 *           - type: string
 *           - type: number
 *           - type: boolean
 *           - type: object
 *             additionalProperties: true
 *           - type: array
 *             items: {}
 */
export type INodeItemInfo = Record<string, ElementJson>;
