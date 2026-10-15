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
 *   responses:
 *     INodeItemAttrMultiRes:
 *       description: Retrieve Successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: array
 *                 description: List of retrieved nodes. There is a maximum of 200 items in one response.
 *                 maxItems: 200
 *                 items:
 *                   $ref: '#/components/schemas/INodeItem'
 *               offset:
 *                 type: integer
 *                 description: The offset of the retrieved nodes in the overall list.
 *               total:
 *                 type: integer
 *                 description: The total number of nodes available in the overall list. Will be given only if the total count is known or calculable.
 *               errors:
 *                 type: array
 *                 description: List of errors encountered during the request.
 *                 items:
 *                   $ref: '#/components/schemas/IErrorItem'
 */
