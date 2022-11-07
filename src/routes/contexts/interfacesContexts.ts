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
