/**
 * @swagger
 * components:
 *   schemas:
 *     TypeListGroupContext:
 *       type: array
 *       items:
 *         type: string
 */
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
 *             $ref: "#/components/schemas/ContextTree"
 *       example:
 *         dynamicId: 377295296
 *         staticId: SpinalContext-b61aca38-c262-56bd-9b3b-72fba07999a4-173a52a9bd8
 *         name: Scenes
 *         type: SpinalService
 *         context: SpinalContext
 *         children:
 *         - dynamicId: 377301280
 *           staticId: SpinalNode-c04c8302-ef21-7fa1-3435-8bf1ecd717b8-173a52a9bde
 *           name: bim
 *           type: scene
 *           children: []
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
 *     ProfilesList:
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
 *         groupeProfile:
 *           type: "object"
 *           properties:
 *             dynamicId:
 *               type: "integer"
 *             name:
 *               type: "string"
 *         categoryProfile:
 *           type: "object"
 *           properties:
 *             dynamicId:
 *               type: "integer"
 *             name:
 *               type: "string"
 *         contextProfile:
 *           type: "object"
 *           properties:
 *             dynamicId:
 *               type: "integer"
 *             name:
 *               type: "string"
 *         categories:
 *           type: "array"
 *           items:
 *             $ref: "#/components/schemas/Context"
 */
