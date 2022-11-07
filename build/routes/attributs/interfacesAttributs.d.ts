/**
* @swagger
* components:
*   schemas:
*     NodeAttribut:
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
*         attributs:
*           type: "array"
*           items:
*             anyOf:
*               - $ref: "#/components/schemas/Attributs"
*/
export interface NodeAttribut {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    attributs: Attributs[];
}
/**
 * @swagger
 * components:
 *   schemas:
 *     Attributs:
 *       type: "object"
 *       properties:
 *         label:
 *           type: "string"
 *         value:
 *           type: "string"
 *         date:
 *           type: "integer"
 *         type:
 *           type: "integer"
 *         unit:
 *           type: "integer"
 */
export interface Attributs {
    label: string;
    value: string;
    date: number;
}
