import type { INodeItemAttr } from './INodeItemAttr';
import type { INodeItemInfo } from './INodeItemInfo';
export type ElementJson = null | string | number | boolean | ElementJson[] | {
    [key: string]: ElementJson;
};
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
 *           description: Runtime database ID used by dynamic-ID request parameters. Distinct from info.staticId.
 *         parentDynamicId:
 *           description: Parent dynamic ID returned by room and equipment list endpoints, including building-wide traversal. For group requests this is the group ID.
 *           type: number
 *         info:
 *           $ref: '#/components/schemas/INodeItemInfo'
 *         attributes:
 *           $ref: '#/components/schemas/INodeItemAttr'
 *         element:
 *           description: Serialized element data when requested on endpoints supporting the element query. Null if the node has no element; omitted when not requested. Nested pointers are represented as objects with a $ptr dynamic ID (or null).
 *           nullable: true
 *           oneOf:
 *             - type: string
 *             - type: number
 *             - type: boolean
 *             - type: array
 *               items: {}
 *             - type: object
 *               additionalProperties: true
 *       example:
 *         dynamicId: 1000123
 *         parentDynamicId: 1000456
 *         info:
 *           staticId: "abc123"
 *           name: "Node Name"
 *           type: "Node Type"
 *           color: "#FFFFFF"
 *           directModificationDate: 1627849200000
 *         attributes:
 *           categoryName1_without_add-attributes-modification-date:
 *             attributeName1: "example value"
 *           categoryName2_with_add-attributes-modification-date:
 *             attributeName2:
 *               value: "example value"
 *               lastModification: 1627849200000
 */
export interface INodeItem {
    dynamicId: number;
    parentDynamicId?: number;
    info?: INodeItemInfo;
    attributes?: INodeItemAttr;
    element?: ElementJson;
}
