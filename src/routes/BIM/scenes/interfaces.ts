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
 *     ISceneListReturn:
 *       type: "object"
 *       properties:
 *         scenes:
 *           type: "array"
 *           items:
 *             $ref: '#/components/schemas/IScenesItem'
 */
export interface ISceneListReturn {
  scenes: IScenesItem[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     IScenesItem:
 *       type: "object"
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         staticId:
 *           type: "string"
 *         name:
 *           type: "string"
 *         description:
 *           type: "string"
 *         type:
 *           type: "string"
 *         autoLoad:
 *           type: "boolean"
 *         useAllDT:
 *           type: "boolean"
 *         sceneAlignMethod:
 *           type: "number"
 *       required:
 *         - dynamicId
 *         - staticId
 *         - name
 *         - description
 *         - type
 */
export interface IScenesItem {
  dynamicId: number;
  staticId: string;
  name: string;
  description: string;
  type: string;
  autoLoad?: boolean;
  useAllDT?: boolean;
  sceneAlignMethod?: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     IOptionsItem:
 *       type: "object"
 *       properties:
 *         urn:
 *           type: "string"
 *         dbIds:
 *           type: "array"
 *           items:
 *             type: "integer"
 *         loadOption:
 *           $ref: '#/components/schemas/ILoadOption'
 *       required:
 *         - urn
 */
export interface IOptionsItem {
  urn: string;
  dbIds?: number[];
  loadOption?: ILoadOption;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ILoadOption:
 *       type: "object"
 *       properties:
 *         globalOffset:
 *           $ref: '#/components/schemas/IGlobalOffset'
 *       required:
 *         - globalOffset
 */
export interface ILoadOption {
  globalOffset: IGlobalOffset;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     IGlobalOffset:
 *       type: "object"
 *       properties:
 *         globalOffset:
 *           type: "object"
 *           properties:
 *             x :
 *               type: "integer"
 *             y :
 *               type: "integer"
 *             z :
 *               type: "integer"
 *       required:
 *         - x
 *         - y
 *         - z
 */
export interface IGlobalOffset {
  x: number;
  y: number;
  z: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     IScenesbody:
 *       type: "object"
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         staticId:
 *           type: "string"
 *         name:
 *           type: "string"
 *         description:
 *           type: "string"
 *         type:
 *           type: "string"
 *         autoLoad:
 *           type: "boolean"
 *         useAllDT:
 *           type: "boolean"
 *         sceneAlignMethod:
 *           type: "integer"
 *         scenesItems:
 *           $ref: '#/components/schemas/IOptionsItem'
 *         options:
 *           $ref: '#/components/schemas/IScenesItemsItem'
 *       required:
 *         - dynamicId
 *         - staticId
 *         - name
 *         - description
 *         - type
 *         - scenesItems
 */
export interface IScenesbody extends IScenesItem {
  options?: IOptionsItem[];
  scenesItems: IScenesItemsItem[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     IScenesItemsItem:
 *       type: "object"
 *       properties:
 *         name :
 *           type: "string"
 *         dynamicId :
 *           type: "integer"
 *         staticId :
 *           type: "string"
 *         item :
 *           type: "string"
 *         aecPath :
 *           type: "string"
 *       required:
 *         - name
 *         - dynamicId
 *         - staticId
 */
export interface IScenesItemsItem {
  name: string;
  dynamicId: number;
  staticId: string;
  item?: string;
  offset?: any;
  aecPath?: string;
}
