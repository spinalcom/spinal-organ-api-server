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
const sendResponseError_1 = require("../../../utilities/v2/errorHandler/sendResponseError");
const schemas_1 = require("../../../utilities/v2/node/relationships/schemas");
const moveNode_1 = require("../../../utilities/v2/node/relationships/moveNode");
module.exports = function (logger, app, middleware) {
    /**
     * @swagger
     * /api/v2/node/{nodeId}/move:
     *   post:
     *     security:
     *       - bearerAuth: [write]
     *     tags: [node]
     *     summary: Move one incoming link to another parent relationship
     *     description: |-
     *       Move an existing SpinalNode by attaching the destination before detaching one exact source link.
     *
     *       Other parent links, descendants, IDs, info, element and attributes are preserved; graph modification timestamps may change.
     *
     *       ### Requirements
     *
     *       - Both relation types are required. Names are exact, without OR or regex matching.
     *       - Node, both parents and any destination `SpinalContext` must be accessible to the current profile before any mutation.
     *       - A destination parent equal to the moved node is rejected. No ancestor-cycle checks or geographic metadata updates are performed.
     *
     *       ### Repeated requests
     *
     *       - Source present: attach destination if absent, then detach source; return `moved`.
     *       - Source absent and destination present: return `alreadyMoved` without mutation.
     *       - Both absent: reject with 400 without attachment.
     *       - Identical source and destination: return `unchanged` if present, otherwise reject with 400.
     *       - An existing destination must already satisfy any requested context membership on both relation and moved node; otherwise reject with 400.
     *       - An absent destination uses `addChildInContext` when `contextDynamicId` is provided, otherwise `addChild`.
     *
     *       ### Context and partial failures
     *
     *       - Source detachment is global across contexts. Old context IDs and empty relations are retained.
     *       - No rollback, transactions or locking are provided. Retrying re-inspects the graph; `alreadyMoved` describes observed state, not request history.
     *       - A mutation failure returns 500 with `stage` and `state`. State describes completed actions, not an atomic current snapshot.
     *       - Attachment failure leaves destination `unknown` and source `notAttempted`; detachment failure leaves source `unknown`.
     *       - Even a rejected asynchronous mutation may have changed the graph. Retry after inspecting the reported state.
     *     parameters:
     *       - $ref: '#/components/parameters/nodeRelationsNodeId'
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/IMoveNode'
     *           example:
     *             from:
     *               parentDynamicId: 101
     *               relationType: PtrLst
     *               relationName: hasSensor
     *             to:
     *               parentDynamicId: 102
     *               relationType: PtrLst
     *               relationName: hasSensor
     *               contextDynamicId: 456
     *     responses:
     *       200:
     *         description: Move completed or requested final state already observed.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               required: [data]
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/IMoveNodeResult'
     *       400:
     *         $ref: '#/components/responses/IErrorItemRes400'
     *       500:
     *         description: Unexpected read failure, or mutation failure with explicit stage and state.
     *         content:
     *           application/json:
     *             schema:
     *               anyOf:
     *                 - $ref: '#/components/schemas/IErrorItem'
     *                 - $ref: '#/components/schemas/IMoveNodeFailure'
     */
    app.post("/api/v2/node/:nodeId/move", (0, express_zod_safe_1.default)({
        params: zod_1.z.strictObject({
            nodeId: zod_1.z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
        }),
        query: zod_1.z.strictObject({}),
        body: schemas_1.moveNodeSchema,
    }), async (req, res) => {
        try {
            return res
                .status(200)
                .json(await (0, moveNode_1.moveNode)(middleware, (0, requestUtilities_1.getProfileId)(req), req.params.nodeId, req.body));
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=moveNode.js.map