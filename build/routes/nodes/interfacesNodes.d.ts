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
 */
export interface Node {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    children_relation_list: Relation[];
    parent_relation_list: Relation[];
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
 */
export interface EndPointNode {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    currentValue: number;
}
