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
 *     Node:
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
 *         children_relation_list:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Relation"
 *     BasicNode:
 *      type: "object"
 *      properties:
 *        dynamicId:
 *          type: "integer"
 *        staticId:
 *          type: "string"
 *        name:
 *          type: "string"
 *        type:
 *          type: "string"
 *     BasicNodeMultiple:
 *      type: "object"
 *      properties:
 *       dynamicId:
 *        type: "integer"
 *       nodes:
 *        type: "array"
 *        items:
 *         $ref: "#/components/schemas/BasicNode"
 *  
 * 
 * 
 */
 

export interface Node {
  dynamicId: number;
  staticId: string;
  name: string;
  type: string;
  children_relation_list: Relation[];
  parent_relation_list: Relation[];
}

export interface BasicNode {
  dynamicId: number;
  staticId: string;
  name: string;
  type: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Relation:
 *       type: "object"
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         staticId:
 *           type: "string"
 *         name:
 *           type: "string"
 *         children_number:
 *           type: "integer"
 */
export interface Relation {
  dynamicId: number;
  staticId: string;
  name: string;
  children_number: number;
}

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
*     EndPointNodeWithId:
*       type: "object"
*       properties:
*         dynamicId:
*           type: "integer"
*         endpoints:
*           type: "array"
*           items:
*             $ref: "#/components/schemas/EndPointNode"
*/

export interface EndPointNode {
  dynamicId: number,
  staticId: string,
  name: string,
  type: string,
  currentValue: number,
  unit?: string,
  saveTimeSeries?: boolean
}



/**
* @swagger
* components:
*   schemas:
*     CreateNode:
*       type: "object"
*       properties:
*         parentId:
*           type: "integer"
*           format: int64
*           description: "The dynamic ID of the parent node"
*         parentToChildRelationName:
*           type: "string"
*           description: "The name of the relation between the parent and the child"
*         parentToChildRelationType:
*           type: "string"
*           description: "The type of the relation between the parent and the child"
*           enum:
*             - "PtrLst"
*             - "LstPtr"
*             - "Ref"
*         addInContext:
*           type: "boolean"
*           description: "If true the node will be added in the context of the parent node else it will just be added as a child"
*         contextId:
*           type: "integer"
*           format: "int64"
*           description: "Required if 'addInContext' is true. The ID of the context to add the node to."
*         name:
*           type: "string"
*           description: "The name of the node"
*         type:
*           type: "string"
*           description: "The type of the node"
*         additionalProperties:
*           type: "string"
*           description: "Any additional properties"
*       required:
*         - parentId
*         - parentToChildRelationName
*         - parentToChildRelationType
*         - addInContext
*         - name
*         - type
*/
export interface CreateNode {
  parentId: number;
  parentToChildRelationName: string;
  parentToChildRelationType: string;
  addInContext: boolean;
  contextId?: number;
  name: string;
  type: string;
  [key: string]: number | string | boolean;
}

