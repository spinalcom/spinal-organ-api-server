/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
 *     INodeItemInfo:
 *       description: Information about the node item
 *       type: object
 *       properties:
 *         staticId:
 *           type: string
 *           description: Static ID of the node (unique id from the database)
 *         name:
 *           type: string
 *           description: Name of the node
 *         type:
 *           type: string
 *           description: Type of the node
 *         color:
 *           type: string
 *           description: Color of the node must be in hexadecimal format (e.g., #FFFFFF)
 *         directModificationDate:
 *           type: number
 *           description: Timestamp of the direct modification date of the node
 *       additionalProperties:
 *         oneOf:
 *           - type: string
 *           - type: number
 *           - type: boolean
 */
export type INodeItemInfo = Record<string, string | number | boolean>;
