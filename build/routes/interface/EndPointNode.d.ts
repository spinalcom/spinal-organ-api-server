/**
 * @swagger
 * components:
 *   schemas:
 *     EndPointNode:
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
 *         currentValue:
 *           type: "integer"
 */
export interface EndPointNode {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    currentValue?: number;
    value?: number;
    unit?: string;
    saveTimeSeries?: boolean;
}
