import type { CategoriesAttribute } from '../attributs/CategoriesAttribute';
/**
 * @swagger
 * components:
 *   schemas:
 *     CategoriesAttributeMultiple:
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
 *             $ref: "#/components/schemas/CategoriesAttribute"
 */
export interface CategoriesAttributeMultiple {
    dynamicId: number;
    nodes: CategoriesAttribute[];
}
