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
