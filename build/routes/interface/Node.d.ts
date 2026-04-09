import type { Relation } from './Relation';
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
    [key: string]: any;
}
