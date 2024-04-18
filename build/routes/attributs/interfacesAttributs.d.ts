/**
* @swagger
* components:
*   schemas:
*     NodeAttribut:
*       type: "object"
*       properties:
*         dynamicId:
*           type: "integer"
*         staticId:
*           type: "string"
*         name:
*           type: "string"
*         type:
*           type: "string"
*         attributs:
*           type: "array"
*           items:
*             anyOf:
*               - $ref: "#/components/schemas/Attributs"
*/
export interface NodeAttribut {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    attributs: Attributs[];
}
/**
 * @swagger
 * components:
 *   schemas:
 *     Attributs:
 *       type: "object"
 *       properties:
 *         label:
 *           type: "string"
 *         value:
 *           type: "string"
 *         date:
 *           type: "integer"
 *         type:
 *           type: "integer"
 *         unit:
 *           type: "integer"
 */
export interface Attributs {
    label: string;
    value: string;
    date: number;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     AttributeUpdate:
 *       type: object
 *       required:
 *         - attributeLabel
 *         - attributeNewValue
 *       properties:
 *         attributeLabel:
 *           type: string
 *           description: The label of the attribute to update.
 *         attributeNewValue:
 *           description: The new value for the attribute, which can be a string, number, or boolean.
 *           oneOf:
 *             - type: string
 *             - type: number
 *             - type: boolean
 *
 *     CategoryAttributeUpdate:
 *       type: object
 *       required:
 *         - categoryName
 *         - attributes
 *       properties:
 *         categoryName:
 *           type: string
 *           description: Name of the category to which the attributes belong.
 *         attributes:
 *           type: array
 *           description: List of attribute updates within the category.
 *           items:
 *             $ref: '#/components/schemas/AttributeUpdate'
 *     NodeAttributeUpdate:
 *       type: object
 *       required:
 *         - dynamicId
 *         - categories
 *       properties:
 *         dynamicId:
 *           type: integer
 *           format: int64
 *           description: Unique identifier for the node, typically used as a dynamic reference.
 *         categories:
 *           type: array
 *           description: Array of categories with attributes to update for the node.
 *           items:
 *             $ref: '#/components/schemas/CategoryAttributeUpdate'
 *     AttributeUpdateResponse:
 *       type: object
 *       properties:
 *         dynamicId:
 *           type: integer
 *           format: int64
 *           description: Unique identifier for the node.
 *         categories:
 *           type: array
 *           description: Array of categories with attributes that were updated for the node.
 *           items:
 *             $ref: '#/components/schemas/CategoryAttributeUpdate'
 */
export interface AttributeUpdate {
    attributeLabel: string;
    attributeNewValue: string;
}
export interface CategoryAttributeUpdate {
    categoryName: string;
    attributes: AttributeUpdate[];
}
export interface NodeAttributeUpdate {
    dynamicId: number;
    categories: CategoryAttributeUpdate[];
}
