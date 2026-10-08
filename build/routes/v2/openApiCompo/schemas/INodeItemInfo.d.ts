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
 *           description: Timestamp of the direct modification date of the node
 *       additionalProperties:
 *         oneOf:
 *           - type: string
 *           - type: number
 *           - type: boolean
 */
export type INodeItemInfo = Record<string, string | number | boolean>;
