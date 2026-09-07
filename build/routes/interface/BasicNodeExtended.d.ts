import type { BasicNode } from './BasicNode';
export type BasicNodeExtended<Attr extends readonly string[] | undefined> = BasicNode & (Attr extends readonly string[] ? {
    [K in Attr[number]]?: string | number | boolean | undefined;
} : {});
/**
 * @swagger
 * components:
 *   schemas:
 *     BasicNodeWithColor:
 *       allOf:
 *         - $ref: "#/components/schemas/BasicNode"
 *         - type: "object"
 *           properties:
 *             color:
 *               type: "string"
 *               description: "Hexadecimal color code representing the color of the node, e.g., #FF5733."
 */
