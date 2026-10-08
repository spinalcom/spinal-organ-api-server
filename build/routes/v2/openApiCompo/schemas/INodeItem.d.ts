import type { INodeItemAttr } from './INodeItemAttr';
import type { INodeItemInfo } from './INodeItemInfo';
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
 *         parentDynamicId:
 *           description: given when the request use the parent-dynamic-id parameter
 *           type: number
 *         info:
 *           $ref: '#/components/schemas/INodeItemInfo'
 *         attributes:
 *           $ref: '#/components/schemas/INodeItemAttr'
 *       example:
 *         dynamicId: 123
 *         parentDynamicId: 456
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
    parentDynamicId?: number;
    info?: INodeItemInfo;
    attributes?: INodeItemAttr;
}
