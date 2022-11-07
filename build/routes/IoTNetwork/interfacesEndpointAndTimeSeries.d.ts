/**
* @swagger
* components:
*   schemas:
*     IoTNetwork:
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
export interface IoTNetwork {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     IoTNetworkTree:
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
 *         IoTNetwork:
 *           type: "string"
 *         children:
 *           type: "array"
 *           items:
 *             $ref: "#/components/schemas/IoTNetworkTree"
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
export interface IoTNetworkTree {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    children: IoTNetworkTree[];
}
/**
* @swagger
* components:
*   schemas:
*     EndPointNodeAttribut:
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
*               - $ref: "#/components/schemas/EndPointAttributs"
*/
export interface EndPointNodeAttribut {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    attributs: EndPointAttributs[];
}
/**
 * @swagger
 * components:
 *   schemas:
 *     EndPointAttributs:
 *       type: "object"
 *       properties:
 *         label:
 *           type: "string"
 *         value:
 *           type: "string"
 *         date:
 *           type: "integer"
 *         type:
 *           type: "string"
 *         unit:
 *           type: "integer"
 */
export interface EndPointAttributs {
    label: string;
    value: string;
    date: number;
    type: string;
    unit: number;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     CurrentValue:
 *       type: "object"
 *       properties:
 *         currentValue:
 *           type: "integer"
 */
export interface CurrentValue {
    label: string;
    value: string;
    date: number;
    type: string;
    unit: number;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     NewValue:
 *       type: "object"
 *       properties:
 *         currentValue:
 *           type: "integer"
 */
export interface NewValue {
    label: string;
    value: string;
    date: number;
    type: string;
    unit: number;
}
export interface ConfigService {
    contextName: string;
    contextType: string;
    networkType: string;
    networkName: string;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     Timeserie:
 *       type: "array"
 *       items:
 *         type: "object"
 *         properties:
 *           date:
 *             type: "integer"
 *           value:
 *             type: "integer"
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     IoTNetworkNodeTypeList:
 *       type: array
 *       items:
 *         type: string
 */
