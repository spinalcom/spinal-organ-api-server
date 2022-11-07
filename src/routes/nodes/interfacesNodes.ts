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
 */

export interface Node {
  dynamicId: number;
  staticId: string;
  name: string;
  type: string;
  children_relation_list: Relation[];
  parent_relation_list: Relation[];
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
 */

export interface EndPointNode {
  dynamicId: number,
  staticId: string,
  name: string,
  type: string,
  currentValue: number
}
