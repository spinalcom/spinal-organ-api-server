import type { EndPointNode } from './EndPointNode';
/**
 * @swagger
 * components:
 *   schemas:
 *     EndPointNodeMultiple:
 *       type: "object"
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         endpoints:
 *           type: "array"
 *           items:
 *             $ref: "#/components/schemas/EndPointNode"
 */
export interface EndPointNodeMultiple {
    dynamicId: number;
    endpoints: EndPointNode[];
}
