export interface Command {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    currentValue: number;
}
/**
* @swagger
* components:
*   schemas:
*     Command:
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
*         CurrentValue:
*           type: "number"
 */
