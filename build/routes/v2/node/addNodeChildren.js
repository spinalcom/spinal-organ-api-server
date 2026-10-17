"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const express_zod_safe_1 = __importDefault(require("express-zod-safe"));
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const createErrorMsgItem_1 = require("../../../utilities/v2/errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../../../utilities/v2/errorHandler/EApiErrorType");
const sendResponseError_1 = require("../../../utilities/v2/errorHandler/sendResponseError");
const schemas_1 = require("../../../utilities/v2/node/relationships/schemas");
const attachChildren_1 = require("../../../utilities/v2/node/relationships/attachChildren");
module.exports = function (logger, app, middleware) {
    /**
     * @swagger
     * /api/v2/node/{parentId}/children:
     *   post:
     *     security:
     *       - bearerAuth: [write]
     *     tags: [node]
     *     summary: Attach existing children to a node
     *     description: |-
     *       Attach existing SpinalNodes; no nodes are created.
     *       The current profile must have access to the parent, each child and any supplied context.
     *
     *       - `relationType` defaults to `PtrLst`; `LstPtr` and `Ref` are also supported.
     *       - With `contextDynamicId`, the target must be a SpinalContext and attachment uses `addChildInContext`.
     *       - Without a context, attachment uses `addChild`.
     *       - An existing edge with the requested context membership (if supplied) is a successful no-op.
     *       - An existing edge missing the requested context membership is rejected with HTTP 400 for that entry; this endpoint does not change context membership on existing edges.
     *       - Entries run in request order. Successful attachments are retained if other entries fail.
     *       - HTTP 200 returns successful entries in `data`, with `attached` or `alreadyAttached` status, and optional per-entry failures in `error`.
     *       - If all entries fail, HTTP 400 is returned, or 500 if any failure is internal. The `errors` array identifies each failed entry.
     *       - Writes are not transactional and concurrent requests are not locked.
     *     parameters:
     *       - name: parentId
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 9007199254740991
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             additionalProperties: false
     *             required: [children]
     *             properties:
     *               children:
     *                 type: array
     *                 minItems: 1
     *                 items:
     *                   $ref: '#/components/schemas/INodeChildAttachment'
     *           example:
     *             children:
     *               - childDynamicId: 123456
     *                 relationName: hasSensor
     *                 contextDynamicId: 654321
     *               - childDynamicId: 123457
     *                 relationName: hasSensor
     *                 relationType: PtrLst
     *     responses:
     *       200:
     *         description: At least one successful attachment or already-attached entry.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               required: [data]
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/INodeChildAttachmentResult'
     *                 error:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/INodeChildAttachmentError'
     *       400:
     *         description: Invalid request or parent, or all children failed validation/attachment. Batch failures include errors.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/INodeChildrenFailure'
     *       500:
     *         description: Unexpected failure, or all entries failed with at least one internal error.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/INodeChildrenFailure'
     */
    app.post("/api/v2/node/:parentId/children", (0, express_zod_safe_1.default)({
        params: zod_1.z.strictObject({
            parentId: zod_1.z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
        }),
        body: zod_1.z.strictObject({ children: zod_1.z.array(schemas_1.childAttachmentSchema).min(1) }),
    }), async (req, res) => {
        try {
            const { data, errors } = await (0, attachChildren_1.attachChildren)(middleware, (0, requestUtilities_1.getProfileId)(req), req.params.parentId, req.body.children);
            if (!data.length) {
                const internal = errors.some((item) => item.errorType === EApiErrorType_1.EApiErrorType.INTERNAL_ERROR);
                return res.status(internal ? 500 : 400).json({
                    ...(0, createErrorMsgItem_1.createErrorMsgItem)(internal
                        ? EApiErrorType_1.EApiErrorType.INTERNAL_ERROR
                        : EApiErrorType_1.EApiErrorType.INVALID_REQUEST, "No child attachment succeeded"),
                    errors,
                });
            }
            return res
                .status(200)
                .json({ data, error: errors.length ? errors : undefined });
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=addNodeChildren.js.map