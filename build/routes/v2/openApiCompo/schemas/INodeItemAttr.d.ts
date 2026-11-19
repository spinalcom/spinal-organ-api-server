import type { INodeItemAttrCat } from './INodeItemAttrCat';
/**
 * @swagger
 * components:
 *   schemas:
 *     INodeItemAttr:
 *       type: object
 *       description: Attributes of the node item categorized by category name
 *       additionalProperties:
 *         $ref: '#/components/schemas/INodeItemAttrCat'
 */
export type INodeItemAttr = Record<string, INodeItemAttrCat>;
