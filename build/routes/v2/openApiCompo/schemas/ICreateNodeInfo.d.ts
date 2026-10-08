/**
 * @swagger
 * components:
 *   schemas:
 *     ICreateNodeInfo:
 *       description: Information about the node to create, including its name, color, and icon.
 *         The following fields are forbidden `id`, `staticId`, `type`, `dynamicId`
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: name of the node
 *           maxLength: 200
 *           minLength: 1
 *         color:
 *           type: string
 *           description:  Hexadecimal color code for the node (e.g., \#FFFFFF)
 *           pattern: "^#([A-Fa-f0-9]{6})$"
 *         icon:
 *           type: string
 *           description: icon of the node
 *       additionalProperties:
 *         oneOf:
 *           - type: string
 *           - type: number
 *           - type: boolean
 */
