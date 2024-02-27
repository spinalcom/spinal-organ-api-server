/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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
 *     HealthStatus:
 *       type: "object"
 *       properties:
 *         name:
 *           type: "integer"
 *         bootTimestamp:
 *           type: "string"
 *         lastHealthTime:
 *           type: "string"
 *         ramRssUsed:
 *           type: "string"
 *         logList:
 *           type: "array"
 *           items: 
 *             type: "object"
 */
export interface HealthStatus {
  name: string;
  bootTimestamp: number;
  lastHealthTime: number;
  ramRssUsed: string;
  state: string;
  logList: string[];
}


/**
 * @swagger
 * components:
 *   schemas:
 *     OrganStatus:
 *       type: "object"
 *       properties:
 *         message:
 *           type: "string"
 *         organs_down:
 *           type: "array"
 *           items:
 *             $ref: '#/components/schemas/HealthStatus'
 */
export interface OrganStatus {
  message: string;
  organs_down: HealthStatus[];
}