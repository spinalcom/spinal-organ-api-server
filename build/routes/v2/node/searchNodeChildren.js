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
const sendResponseError_1 = require("../../../utilities/v2/errorHandler/sendResponseError");
const parseParentDynIdList_1 = require("../../../utilities/v2/requestParse/parseParentDynIdList");
const listNodeChildrenBatch_1 = require("../../../utilities/v2/node/listNodeChildrenBatch");
const searchNodeChildrenSchema = zod_1.z.strictObject({
    parentIds: parseParentDynIdList_1.parentDynamicIdsBodySchema,
    relationType: zod_1.z.enum(['PtrLst', 'LstPtr', 'Ref']).optional(),
    relationNames: zod_1.z.array(zod_1.z.string().trim().min(1)).min(1).optional(),
    contextDynamicId: zod_1.z
        .number()
        .int()
        .min(1)
        .max(Number.MAX_SAFE_INTEGER)
        .optional(),
    info: zod_1.z.string().optional(),
    attributes: zod_1.z.string().optional(),
    element: zod_1.z.string().optional(),
    addAttributesModificationDate: zod_1.z.boolean().optional(),
    filter: zod_1.z.union([zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()), zod_1.z.string()]).optional(),
    offset: zod_1.z
        .number()
        .int()
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
        .optional()
        .default(0),
});
module.exports = function (logger, app, middleware) {
    /**
     * @swagger
     * /api/v2/node/children/search:
     *   post:
     *     security:
     *       - bearerAuth: [read]
     *     summary: List distinct direct children of several parents
     *     description: |-
     *       Batch version of `GET /api/v2/node/{parentId}/children`, with options sent in a JSON body.
     *
     *       - `parentIds` is required: an array of 1 to 50 parent dynamic IDs. Duplicate IDs are ignored.
     *       - Relation type/name and context selectors restrict traversal, as on GET children. `relationNames` is an array here, not a comma-separated string.
     *       - Children are deduplicated **per parent**. A child under two parents appears once under each, with its own `parentDynamicId`.
     *       - Filters use **AND**, run **before** `offset`, and return at most **200 matching items** per page.
     *       - Parents are processed in input order; any load failure fails the whole request.
     *       - `total` is the number of items returned in this page.
     *     tags:
     *       - node
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [parentIds]
     *             additionalProperties: false
     *             properties:
     *               parentIds:
     *                 type: array
     *                 minItems: 1
     *                 maxItems: 50
     *                 items:
     *                   type: integer
     *                   minimum: 1
     *                 example: [132456, 132457]
     *               relationType:
     *                 type: string
     *                 enum: ['PtrLst', 'LstPtr', 'Ref']
     *               relationNames:
     *                 type: array
     *                 minItems: 1
     *                 items:
     *                   type: string
     *                 example: ['hasEquipment']
     *               contextDynamicId:
     *                 type: integer
     *                 minimum: 1
     *               info:
     *                 type: string
     *                 description: Same format as the `info` query parameter.
     *                 example: name,type
     *               attributes:
     *                 type: string
     *                 description: Same format as the `attributes` query parameter.
     *               element:
     *                 type: string
     *                 description: Same format as the `element` query parameter.
     *               addAttributesModificationDate:
     *                 type: boolean
     *               filter:
     *                 type: object
     *                 description: Same filter object as the `filter` query parameter.
     *                 example:
     *                   attributes.Geometry.Surface:
     *                     exists: true
     *               offset:
     *                 type: integer
     *                 minimum: 0
     *                 default: 0
     *     responses:
     *       200:
     *         description: Child nodes retrieved successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/INodeItem'
     *                 offset:
     *                   type: integer
     *                 total:
     *                   type: integer
     *                   description: Number of items in this page (after filters and offset).
     *       400:
     *         $ref: '#/components/responses/IErrorItemRes400'
     *       500:
     *         $ref: '#/components/responses/IErrorItemRes500'
     */
    app.post('/api/v2/node/children/search', (0, express_zod_safe_1.default)({ body: searchNodeChildrenSchema }), async (req, res) => {
        try {
            const { parentIds, relationType, relationNames, contextDynamicId, info, attributes, element, addAttributesModificationDate, filter, offset, } = req.body;
            return res.status(200).json(await (0, listNodeChildrenBatch_1.listNodeChildrenBatch)(middleware, (0, requestUtilities_1.getProfileId)(req), {
                parentIds,
                relationType,
                relationNames,
                contextDynamicId,
                info,
                attributes,
                element,
                addAttributesModificationDate,
                filter,
                offset,
            }));
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=searchNodeChildren.js.map