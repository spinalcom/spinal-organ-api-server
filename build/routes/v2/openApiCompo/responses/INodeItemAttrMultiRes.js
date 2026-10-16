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
 *       description: Nodes retrieved successfully.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: array
 *                 description: Retrieved nodes. Room and equipment lists return at most 200 items; floor lists are not paginated.
 *                 items:
 *                   $ref: '#/components/schemas/INodeItem'
 *               offset:
 *                 type: integer
 *                 description: Requested number of matching nodes skipped. Returned by paginated room and equipment lists.
 *               total:
 *                 type: integer
 *                 description: Number of eligible children before filtering when a parent-dynamic-id is supplied. Omitted for building-wide traversal and floor lists. This is not a count of filter matches.
 *               errors:
 *                 type: array
 *                 description: List of errors encountered during the request.
 *                 items:
 *                   $ref: '#/components/schemas/IErrorItem'
 */
//# sourceMappingURL=INodeItemAttrMultiRes.js.map