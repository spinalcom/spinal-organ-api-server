import type { INodeItemAttrCatAttrAndDate } from './INodeItemAttrCatAttrAndDate';
/**
 * @swagger
 * components:
 *   schemas:
 *     INodeItemAttrCat:
 *       type: object
 *       description: Attribute category containing individual attributes.
 *       additionalProperties:
 *         type: object
 *         description: Value of the attribute.
 *           Depending on the `add-attributes-modification-date` flag,
 *           either as a string or an object with its value and last modification date.
 *         oneOf:
 *           - type: string
 *             description: Attribute value as a string
 *           - type: object
 *             description: Attribute value along with its last modification date
 *             $ref: '#/components/schemas/INodeItemAttrCatAttrAndDate'
 */
export type INodeItemAttrCat = Record<string, string | INodeItemAttrCatAttrAndDate>;
