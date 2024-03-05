/**
 * @swagger
 * components:
 *   schemas:
 *     Context:
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
export interface Context {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     BIMFileContext:
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
 *         items:
 *           type: "array"
 *           items:
 *             $ref: '#/components/schemas/BIMFileContextItems'
 *       required:
 *         - dynamicId
 *         - staticId
 *         - name
 *         - type
 *         - items
 */
export interface BIMFileContext {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    offset: any;
    items: BIMFileContextItems[];
}
/**
 * @swagger
 * components:
 *   schemas:
 *     BIMFileContextItems:
 *       type: "object"
 *       properties:
 *         name:
 *           type: "string"
 *         path:
 *           type: "string"
 *         thumbnail:
 *           type: "string"
 *       required:
 *         - name
 *         - path
 */
export interface BIMFileContextItems {
    name: string;
    path: string;
    thumbnail?: string;
    aecPath?: string;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     NodeWithDate:
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
 *         directModificationDate:
 *           type: "integer"
 *         indirectModificationDate:
 *           type: "integer"
 */
export interface NodeWithDate {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     ContextNodeofTypes:
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
export interface ContextNodeofTypes {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     ContextTree:
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
 *         context:
 *           type: "string"
 *         children:
 *           type: "array"
 *           items:
 *            $ref: '#/components/schemas/Context'
 */
export interface ContextTree {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    context?: string;
    children: ContextTree[];
}
/**
 * @swagger
 * components:
 *   schemas:
 *     ContextNodeTypeList:
 *       type: array
 *       items:
 *         type: string
 */
