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
 *     ContextEvent:
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
export interface ContextEvent {
  dynamicId: number;
  staticId: string;
  name: string;
  type: string;
}


/**
 * @swagger
 * components:
 *   schemas:
 *     CategoryEvent:
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
export interface CategoryEvent {
  dynamicId: number;
  staticId: string;
  name: string;
  type: string;
}


/**
 * @swagger
 * components:
 *   schemas:
 *     GroupEvent:
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
export interface GroupEvent {
  dynamicId: number;
  staticId: string;
  name: string;
  type: string;
}



/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
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
 *         groupeId:
 *           type: "string"
 *         categoryId:
 *           type: "string"
 *         nodeId:
 *           type: "string"
 *         repeat:
 *           type: "boolean"
 *         description:
 *           type: "string"
 *         startDate:
 *           type: "string"
 *         endDate:
 *           type: "string"
 *         creationDate:
 *           type: "string"
 *         user:
 *           type: "object"
 */
export interface Event {
  dynamicId: number;
  staticId: string;
  name: string;
  type: string;
  groupeId: string;
  categoryId: string;
  nodeId: string;
  repeat: boolean;
  description: string;
  startDate: string;
  endDate: string;
}
