/**
 * @swagger
 * components:
 *   schemas:
 *     INodeItem:
 *       type: object
 *       required:
 *         - dynamicId
 *       properties:
 *         dynamicId:
 *           type: number
 *         info:
 *           $ref: '#/components/schemas/INodeItemInfo'
 *         attributes:
 *           $ref: '#/components/schemas/INodeItemAttr'
 *       example:
 *         dynamicId: 123
 *         info:
 *           staticId: "abc123"
 *           name: "Node Name"
 *           type: "Node Type"
 *           color: "#FFFFFF"
 *           directModificationDate: 1627849200
 *         attributes:
 *           categoryName1_without_add-attributes-modification-date:
 *             attributeName1: "example value"
 *           categoryName2_with_add-attributes-modification-date:
 *             attributeName2:
 *               value: "example value"
 *               lastModification: 1627849200
 */
export interface INodeItem {
    dynamicId: number;
    info?: INodeItemInfo;
    attributes?: INodeItemAttr;
}
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
/**
 * @swagger
 * components:
 *   schemas:
 *     INodeItemAttr:
 *       type: object
 *       description: Attributes of the node item categorized by category name
 *       additionalProperties:
 *         type: object
 *         additionalProperties:
 *           type: object
 *           description: Value of the attribute. Depending on the add-attributes-modification-date flag, either as a string or an object with its value and last modification date
 *           oneOf:
 *             - type: string
 *               description: Attribute value as a string
 *             - type: object
 *               description: Attribute value along with its last modification date
 *               $ref: '#/components/schemas/INodeItemAttrCatAttrAndDate'
 */
export type INodeItemAttr = Record<string, INodeItemAttrCat>;
export type INodeItemAttrCat = Record<string, string | INodeItemAttrCatAttrAndDate>;
/**
 * @swagger
 * components:
 *   schemas:
 *     INodeItemAttrCatAttrAndDate:
 *       type: object
 *       description: attribute value and its last modification date
 *       properties:
 *         value:
 *           type: string
 *         lastModification:
 *           type: number
 *       example:
 *         value: "example value"
 *         lastModification: 1627849200
 */
export type INodeItemAttrCatAttrAndDate = {
    value: string;
    lastModification: number;
};
