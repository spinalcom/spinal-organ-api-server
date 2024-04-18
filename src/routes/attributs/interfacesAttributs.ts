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
*     NodeAttribut:
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
*               - $ref: "#/components/schemas/Attributs"
*/
export interface NodeAttribut {

  dynamicId: number,
  staticId: string,
  name: string,
  type: string,
  attributs: Attributs[]
}


/**
 * @swagger
 * components:
 *   schemas:
 *     Attributs:
 *       type: "object"
 *       properties:
 *         label:
 *           type: "string"
 *         value:
 *           type: "string"
 *         date:
 *           type: "integer"
 *         type:
 *           type: "integer"
 *         unit:
 *           type: "integer"
 */
export interface Attributs {
  label: string,
  value: string,
  date: number
}

/**
 * @swagger
 * components:
 *   schemas:
 *     AttributeUpdate:
 *       type: object
 *       required:
 *         - attributeLabel
 *         - attributeNewValue
 *       properties:
 *         attributeLabel:
 *           type: string
 *           description: The label of the attribute to update.
 *         attributeNewValue:
 *           description: The new value for the attribute, which can be a string, number, or boolean.
 *           oneOf:
 *             - type: string
 *             - type: number
 *             - type: boolean
 *     
 *     CategoryAttributeUpdate:
 *       type: object
 *       required:
 *         - categoryName
 *         - attributes
 *       properties:
 *         categoryName:
 *           type: string
 *           description: Name of the category to which the attributes belong.
 *         attributes:
 *           type: array
 *           description: List of attribute updates within the category.
 *           items:
 *             $ref: '#/components/schemas/AttributeUpdate'
 *     NodeAttributeUpdate:
 *       type: object
 *       required:
 *         - dynamicId
 *         - categories
 *       properties:
 *         dynamicId:
 *           type: integer
 *           format: int64
 *           description: Unique identifier for the node, typically used as a dynamic reference.
 *         categories:
 *           type: array
 *           description: Array of categories with attributes to update for the node.
 *           items:
 *             $ref: '#/components/schemas/CategoryAttributeUpdate'
 *     AttributeUpdateResponse:
 *       type: object
 *       properties:
 *         dynamicId:
 *           type: integer
 *           format: int64
 *           description: Unique identifier for the node.
 *         categories:
 *           type: array
 *           description: Array of categories with attributes that were updated for the node.
 *           items:
 *             $ref: '#/components/schemas/CategoryAttributeUpdate'
 */  




export interface AttributeUpdate {
  attributeLabel: string,
  attributeNewValue: string

}

export interface CategoryAttributeUpdate {
  categoryName: string,
  attributes: AttributeUpdate[]
}

export interface NodeAttributeUpdate {
  dynamicId: number,
  categories: CategoryAttributeUpdate[]
  
}
