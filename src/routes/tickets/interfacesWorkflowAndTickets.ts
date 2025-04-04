/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Workflow:
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
export interface Workflow {
  dynamicId: number;
  staticId: string;
  name: string;
  type: string;
  color?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     WorkflowTree:
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
 *         Workflow:
 *           type: "string"
 *         children:
 *           type: "array"
 *           items:
 *             $ref: "#/components/schemas/WorkflowTree"
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
export interface WorkflowTree {
  dynamicId: number,
  staticId: string,
  name: string,
  type: string,
  children: WorkflowTree[]
}


/**
 * @swagger
 * components:
 *   schemas:
 *     Step:
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
 *         color:
 *           type: "string"
 *         order:
 *           type: "integer"
 *         processId:
 *           type: "string"
 */
export interface Step {
  dynamicId: number,
  staticId: string,
  name: string,
  type: string,
  color: string,
  order: number,
  processId: string
}

/**
 * @swagger
 * components:
 *   schemas:
 *     TicketDetails:
 *       type: "object"
 *       properties:
 *         dynamicId:
 *           type: "number"
 *         staticId:
 *           type: "string"
 *         name:
 *           type: "string"
 *         type:
 *           type: "string"
 *         priority:
 *           type: "integer"
 *         creationDate:
 *           type: "integer"
 *         elementSelectedId:
 *           type: "integer"
 *         userName:
 *           type: "string"
 *         Step:
 *           type: "object"
 *           properties:
 *             dynamicId:
 *               type: "number"
 *             staticId:
 *               type: "string"
 *             name:
 *               type: "string"
 *             type:
 *               type: "string"
 *             color:
 *               type: "string"
 *             order:
 *               type: "string"
 *         workflowDynamicId:
 *           type: "integer"
 *         workflowName:
 *           type: "string"
 *         Annotation_list:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Note"
 *         file_list:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/File"
 *         log_list:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/LogTicket"
 */
export interface TicketDetails {
  dynamicId: number,
  staticId: string,
  name: string,
  type: string,
  priority: number,
  creationDate: number,
  elementSelectedId: number,
  userName: string,
  stepId: string,
  workflowId: number,
  workflowName: string,
  annotation_list: [],
  file_list: [],
  log_list: []
}


/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
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

/**
* @swagger
* components:
*   schemas:
*     BasicNode:
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

/**
* @swagger
* components:
*   schemas:
*     Process:
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

/**
* @swagger
* components:
*   schemas:
*     LogTicket:
*       type: "object"
*       properties:
*         userName:
*           type: "string"
*         date:
*           type: "number"
*         event:
*           type: "number"
*         ticketStaticId:
*           type: "string"
*/


/**
 * @swagger
 * components:
 *   schemas:
 *     WorkflowNodeTypeList:
 *       type: array
 *       items:
 *         type: string
 */
