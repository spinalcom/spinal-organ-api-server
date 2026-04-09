import type { CategoryAttributeUpdate } from './CategoryAttributeUpdate';
/**
 * @swagger
 * components:
 *   schemas:
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
 */
export interface NodeAttributeUpdate {
    dynamicId: number;
    categories: CategoryAttributeUpdate[];
}
