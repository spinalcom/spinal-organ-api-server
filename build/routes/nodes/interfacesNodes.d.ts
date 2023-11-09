/**
 * @swagger
 * components:
 *   schemas:
 *     Node:
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
 *         children_relation_list:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Relation"
 *     BasicNode:
 *      type: "object"
 *      properties:
 *        dynamicId:
 *          type: "integer"
 *        staticId:
 *          type: "string"
 *        name:
 *          type: "string"
 *        type:
 *          type: "string"
 *     BasicNodeMultiple:
 *      type: "object"
 *      properties:
 *       dynamicId:
 *        type: "integer"
 *       nodes:
 *        type: "array"
 *        items:
 *         $ref: "#/components/schemas/BasicNode"
 *
 *
 *
 */
export interface Node {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    children_relation_list: Relation[];
    parent_relation_list: Relation[];
}
export interface BasicNode {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     Relation:
 *       type: "object"
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         staticId:
 *           type: "string"
 *         name:
 *           type: "string"
 *         children_number:
 *           type: "integer"
 */
export interface Relation {
    dynamicId: number;
    staticId: string;
    name: string;
    children_number: number;
}
/**
* @swagger
* components:
*   schemas:
*     EndPointNode:
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
*         currentValue:
*           type: "integer"
*     EndPointNodeWithId:
*       type: "object"
*       properties:
*         dynamicId:
*           type: "integer"
*         endpoints:
*           type: "array"
*           items:
*             $ref: "#/components/schemas/EndPointNode"
*/
export interface EndPointNode {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    currentValue: number;
}
