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
 *     ICreateNodeInfo:
 *       description: Information about the node to create, including its name, color, and icon.
 *         The following fields are forbidden `id`, `staticId`, `type`, `dynamicId`
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: name of the node
 *           maxLength: 200
 *           minLength: 1
 *         color:
 *           type: string
 *           description:  Hexadecimal color code for the node (e.g., \#FFFFFF)
 *           pattern: "^#([A-Fa-f0-9]{6})$"
 *         icon:
 *           type: string
 *           description: icon of the node
 *       additionalProperties:
 *         oneOf:
 *           - type: string
 *           - type: number
 *           - type: boolean
 */
