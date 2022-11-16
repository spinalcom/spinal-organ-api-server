/**
* @swagger
* components:
*   schemas:
*     CategoriesAttribute:
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
 */
export interface CategoriesAttribute {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
}
