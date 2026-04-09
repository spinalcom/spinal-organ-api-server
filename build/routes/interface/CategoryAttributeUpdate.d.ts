import type { AttributeUpdate } from './AttributeUpdate';
/**
 * @swagger
 * components:
 *   schemas:
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
 */
export interface CategoryAttributeUpdate {
    categoryName: string;
    attributes: AttributeUpdate[];
}
