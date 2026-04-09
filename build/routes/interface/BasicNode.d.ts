/**
 * @swagger
 * components:
 *   schemas:
 *     BasicNode:
 *       type: "object"
 *       required:
 *         - dynamicId
 *         - staticId
 *         - name
 *         - type
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         staticId:
 *           type: "string"
 *         name:
 *           type: "string"
 *         type:
 *           type: "string"
 *         icon:
 *           type: "string"
 *         bimFileId:
 *           type: "string"
 *         dbid:
 *           type: "integer"
 */
export interface BasicNode {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    icon?: string;
    bimFileId?: string;
    dbid?: number;
}
