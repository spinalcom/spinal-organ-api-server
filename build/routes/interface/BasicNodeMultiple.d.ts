import type { BasicNode } from './BasicNode';
/**
 * @swagger
 * components:
 *   schemas:
 *     BasicNodeMultiple:
 *       type: "object"
 *       required:
 *         - dynamicId
 *         - nodes
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         nodes:
 *           type: "array"
 *           items:
 *             $ref: "#/components/schemas/BasicNode"
 */
export interface BasicNodeMultiple {
    dynamicId: number;
    nodes: BasicNode[];
}
