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
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
const patchNode_1 = require("../../../utilities/v2/node/patchNode");
const getNodeData_1 = require("../../../utilities/v2/node/getNodeData");
const parseInfoQuery_1 = require("../../../utilities/v2/requestParse/parseInfoQuery");
const parseAttributesQuery_1 = require("../../../utilities/v2/requestParse/parseAttributesQuery");
const getNodeElement_1 = require("../../../utilities/v2/node/getNodeElement");
const sendResponseError_1 = require("../../../utilities/v2/errorHandler/sendResponseError");
const createErrorMsgItem_1 = require("../../../utilities/v2/errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../../../utilities/v2/errorHandler/EApiErrorType");
module.exports = function (logger, app, middleware) {
    /**
     * @swagger
     * /api/v2/node/{nodeId}:
     *   patch:
     *     security:
     *       - bearerAuth: [write]
     *     tags: [node]
     *     summary: Update node info, element and categorized attributes
     *     description: |-
     *       Omitted sections are unchanged. Use `set`, `remove` and `rename` operations.
     *
     *       ### Operations
     *
     *       - Info and element paths use dot notation; missing intermediate objects are created by `set`.
     *       - Assigned objects and arrays replace the entire field. Array indexes must exist; resizing and entry removal/rename are not supported.
     *       - Renaming an object field preserves its Model and must stay in the same parent object. Attribute renames preserve the attribute and its value Model.
     *       - Missing rename sources and occupied destinations are errors. Missing remove targets are ignored.
     *       - Overlapping operations are rejected. Source-equals-destination renames are no-ops.
     *
     *       ### Protected fields and references
     *
     *       - IDs (`info.id`, `info.staticId`, `info.dynamicId` and the top-level `dynamicId`) are immutable.
     *       - `info.type` and `info.name` can be set to nonempty strings, but cannot be removed or renamed.
     *       - Underscore-prefixed and reserved Model keys are forbidden.
     *       - `$modelRef` supports profile-accessible node IDs and `"self"`, resolved against the final patch state. Forward references are supported; cycles are rejected.
     *       - Compatible scalar Models are updated in place, which affects other nodes sharing those Models.
     *
     *       ### Staging and response
     *
     *       - Validation and reference resolution run on staged data before writes. Writes are not a database transaction and do not lock concurrent requests.
     *       - Staging selects top-level info/element branches touched by operations or self references, then recursively clones those branches.
     *       - A name-only update does not load the element or attribute categories. Attribute staging selects needed categories and labels.
     *       - Whole-element self references require staging the complete element. Response projections may independently load additional data.
     *       - Returns the same projections and defaults as GET node by ID.
     *     parameters:
     *       - name: nodeId
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 9007199254740991
     *       - $ref: '#/components/parameters/queryInfo'
     *       - $ref: '#/components/parameters/queryAttributes'
     *       - $ref: '#/components/parameters/queryElement'
     *       - $ref: '#/components/parameters/queryAddAttributesModificationDate'
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/IPatchNode'
     *           example:
     *             info:
     *               set:
     *                 name: Updated sensor
     *                 type: sensor
     *                 metadata.unit: Celsius
     *             element:
     *               set:
     *                 value: 22.5
     *                 unit:
     *                   $modelRef: self
     *                   path: info.metadata.unit
     *               remove: [obsoleteField]
     *             attributes:
     *               rename:
     *                 - category: Technical
     *                   from: OldCode
     *                   to: Code
     *     responses:
     *       200:
     *         description: Updated node with selected response projections.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               required: [data]
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/INodeItem'
     *       400:
     *         $ref: '#/components/responses/IErrorItemRes400'
     *       500:
     *         $ref: '#/components/responses/IErrorItemRes500'
     */
    app.patch("/api/v2/node/:nodeId", (0, express_zod_safe_1.default)({
        params: zod_1.z.strictObject({
            nodeId: zod_1.z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
        }),
        query: zod_1.z.strictObject({
            info: zod_1.z.string().optional(),
            attributes: zod_1.z.string().optional(),
            element: zod_1.z.string().optional(),
            "add-attributes-modification-date": zod_1.z.stringbool().optional(),
        }),
        body: patchNode_1.patchNodeSchema,
    }), async (req, res) => {
        try {
            const info = (0, parseInfoQuery_1.parseInfoQuery)(req.query.info);
            if (Array.isArray(info)) {
                for (const field of info) {
                    const parsed = (0, getNodeElement_1.parseElementQuery)(field);
                    if (!Array.isArray(parsed) || parsed.length !== 1) {
                        throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, "Invalid info field path");
                    }
                }
            }
            const attributes = (0, parseAttributesQuery_1.parseAttributesQuery)(req.query.attributes);
            const element = (0, getNodeElement_1.parseElementQuery)(req.query.element);
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, req.params.nodeId, profileId);
            await (0, patchNode_1.patchNode)(node, req.body, middleware, profileId);
            const data = await (0, getNodeData_1.getNodeData)(node, info, attributes, req.query["add-attributes-modification-date"], undefined, element);
            return res.status(200).json({ data });
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=patchNodeById.js.map