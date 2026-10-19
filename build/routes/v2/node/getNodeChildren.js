"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const express_zod_safe_1 = __importDefault(require("express-zod-safe"));
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const listNodeRelations_1 = require("../../../utilities/v2/node/listNodeRelations");
const sendResponseError_1 = require("../../../utilities/v2/errorHandler/sendResponseError");
module.exports = function (logger, app, middleware) {
    /**
     * @swagger
     * /api/v2/node/{parentId}/children:
     *   get:
     *     security:
     *       - bearerAuth: [read]
     *     tags: [node]
     *     summary: List distinct direct children
     *     description: |-
     *       Inspect outgoing relations only, without recursive traversal.
     *
     *       - Optional relation type/name and context selectors restrict traversal.
     *       - Children are deduplicated by static ID before filtering and pagination.
     *       - All parent, context and child loads use the current profile; inaccessible child loads fail the request rather than returning incomplete success.
     *       - Filters run before `offset`; each page contains at most **200 matching distinct nodes**.
     *       - `total` is the number returned in this page. Ordering follows graph traversal; concurrent changes may shift pages.
     *       - No matches returns `data: []`.
     *     parameters:
     *       - $ref: '#/components/parameters/nodeChildrenParentId'
     *       - $ref: '#/components/parameters/nodeChildrenRelationType'
     *       - $ref: '#/components/parameters/nodeChildrenRelationName'
     *       - $ref: '#/components/parameters/nodeChildrenContext'
     *       - $ref: '#/components/parameters/queryInfo'
     *       - $ref: '#/components/parameters/queryAttributes'
     *       - $ref: '#/components/parameters/queryElement'
     *       - $ref: '#/components/parameters/queryFilter'
     *       - $ref: '#/components/parameters/queryOffset'
     *       - $ref: '#/components/parameters/queryAddAttributesModificationDate'
     *     responses:
     *       200:
     *         description: Page of distinct children.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               required: [data, offset, total]
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/INodeItem'
     *                 offset:
     *                   type: integer
     *                 total:
     *                   type: integer
     *       400:
     *         $ref: '#/components/responses/IErrorItemRes400'
     *       500:
     *         $ref: '#/components/responses/IErrorItemRes500'
     */
    app.get('/api/v2/node/:parentId/children', (0, express_zod_safe_1.default)({
        params: zod_1.z.strictObject({
            parentId: zod_1.z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
        }),
        query: listNodeRelations_1.relationsQuerySchema,
    }), async (req, res) => {
        try {
            return res
                .status(200)
                .json(await (0, listNodeRelations_1.listNodeRelations)(middleware, (0, requestUtilities_1.getProfileId)(req), req.params.parentId, req.query, false, 'children'));
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=getNodeChildren.js.map