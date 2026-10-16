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
const spinal_model_graph_1 = require("spinal-model-graph");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
const addExtraInfoValidation_1 = require("../../../utilities/v2/requestParse/addExtraInfoValidation");
const handleSetInfo_1 = require("../../../utilities/v2/node/handleSetInfo");
const handleSetAttribute_1 = require("../../../utilities/v2/node/handleSetAttribute");
const getNodeData_1 = require("../../../utilities/v2/node/getNodeData");
const createErrorMsgItem_1 = require("../../../utilities/v2/errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../../../utilities/v2/errorHandler/EApiErrorType");
const sendResponseError_1 = require("../../../utilities/v2/errorHandler/sendResponseError");
const createElement_1 = require("../../../utilities/v2/node/createElement");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v2/node:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Create a node and attach it to parents
     *     description: |-
     *       Create one `SpinalNode` with a caller-supplied name and type.
     *
     *       ### Parents and relations
     *       - Supply at least one entry in `parents`. All entries attach the **same node**.
     *       - Each entry requires `parentDynamicId` and `relationName`.
     *       - `relationType` defaults to `PtrLst`; `LstPtr` and `Ref` are also supported.
     *       - With `contextDynamicId`, load a `SpinalContext` and use `addChildInContext`.
     *       - Without a context, use `addChild`.
     *       - Parents and contexts are loaded using the current profile.
     *
     *       ### Element (optional)
     *       - Supply an object directly in `element` to create a generic SpinalCore `Model`.
     *       - Values may be strings, finite numbers, booleans, nested objects or arrays. `null` is not supported.
     *       - Object keys must not start with `_` or shadow Model members (for example `get`, `set`, `constructor`, `model_id`).
     *       - Use `{ "$modelRef": 789012 }` as a value to load an existing Model by dynamic ID using the current profile. References work in nested objects and arrays.
     *       - A reference object must contain only `$modelRef`, with a positive safe integer ID. `$modelRef` is reserved, and cannot be a field on the root element.
     *       - **Administration rights may be required to use `$modelRef`**, depending on access to the referenced model.
     *       - Referenced Models are assigned directly as attributes, not copied or wrapped in additional pointers. Repeated IDs share one loaded Model.
     *       - The newly created element Model is passed to the SpinalNode constructor, which keeps it behind the node's element pointer.
     *       - All references are validated and loaded before any parent attachment. Invalid or inaccessible references reject the request.
     *       - If omitted, no element is created by this endpoint.
     *       - The response remains `INodeItem`; element contents are not included.
     *
     *       ### Results
     *       - **201:** at least one attachment succeeded. Returns the node with all info and attributes.
     *       - Extra info supports nested objects, arrays and `$modelRef` values with the same rules as element data. Administration rights may be required for `$modelRef`.
     *       - Info keys starting with `_` are forbidden at every nesting level, including objects inside arrays. Invalid keys return HTTP 400.
     *       - Successful attachments are retained when others fail.
     *       - Failed entries are reported in `error`, including their zero-based index and requested parent/relation.
     *       - **400:** invalid input, or all attachments failed due to invalid parents or contexts.
     *       - **500:** unexpected failure; also used when all attachments fail and an internal error occurred.
     *       - No uniqueness constraint is imposed on the name. No default attributes are added.
     *     tags:
     *       - node
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - info
     *               - parents
     *             properties:
     *               info:
     *                 type: object
     *                 required:
     *                   - name
     *                   - type
     *                 description: Info fields, including nested objects, arrays and $modelRef values. Keys starting with an underscore are forbidden at every nesting level, including objects inside arrays (HTTP 400). IDs (id, staticId, dynamicId) are assigned by the server and cannot be supplied.
     *                 properties:
     *                   name:
     *                     type: string
     *                     minLength: 1
     *                     maxLength: 200
     *                   type:
     *                     type: string
     *                     minLength: 1
     *                     maxLength: 200
     *                 additionalProperties:
     *                   $ref: '#/components/schemas/INodeElementValue'
     *               attributes:
     *                 $ref: '#/components/schemas/ICreateNodeItemAttr'
     *               element:
     *                 $ref: '#/components/schemas/ICreateNodeElement'
     *               parents:
     *                 type: array
     *                 minItems: 1
     *                 items:
     *                   $ref: '#/components/schemas/INodeParentAttachment'
     *           example:
     *             info:
     *               name: My sensor
     *               type: sensor
     *             attributes:
     *               Technical:
     *                 Code: "001"
     *             element:
     *               value: 21.5
     *               unit: Celsius
     *               enabled: true
     *               device:
     *                 $modelRef: 789012
     *             parents:
     *               - parentDynamicId: 123456
     *                 relationName: hasSensor
     *                 contextDynamicId: 654321
     *               - parentDynamicId: 123457
     *                 relationName: hasSensor
     *                 relationType: PtrLst
     *     responses:
     *       201:
     *         description: Node created with at least one successful parent attachment.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               required:
     *                 - data
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/INodeItem'
     *                 error:
     *                   type: array
     *                   description: Failed attachments. Omitted if all attachments succeeded.
     *                   items:
     *                     $ref: '#/components/schemas/INodeParentAttachmentError'
     *       400:
     *         description: Invalid request, inaccessible or invalid referenced element, or no parent attachment succeeded. When all attachments fail, errors contains the per-entry failures.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/INodeAttachmentFailure'
     *       500:
     *         description: Unexpected error, or all attachments failed with at least one internal error.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/INodeAttachmentFailure'
     */
    app.post("/api/v2/node", (0, express_zod_safe_1.default)({
        body: zod_1.z.strictObject({
            info: (0, addExtraInfoValidation_1.addExtraInfoValidation)(zod_1.z.object({
                name: zod_1.z.string().min(1).max(200),
                type: zod_1.z.string().min(1).max(200),
            }), ["id", "staticId", "dynamicId"]),
            attributes: zod_1.z
                .record(zod_1.z.string(), zod_1.z.record(zod_1.z.string(), zod_1.z.string()))
                .optional(),
            element: createElement_1.elementObject.optional(),
            parents: zod_1.z
                .array(zod_1.z.strictObject({
                parentDynamicId: zod_1.z
                    .number()
                    .int()
                    .min(1)
                    .max(Number.MAX_SAFE_INTEGER),
                relationName: zod_1.z.string().trim().min(1),
                relationType: zod_1.z
                    .enum([
                    spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE,
                    spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE,
                    spinal_model_graph_1.SPINAL_RELATION_TYPE,
                ])
                    .optional()
                    .default(spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE),
                contextDynamicId: zod_1.z
                    .number()
                    .int()
                    .min(1)
                    .max(Number.MAX_SAFE_INTEGER)
                    .optional(),
            }))
                .min(1),
        }),
    }), async (req, res) => {
        try {
            const { info, attributes, parents, element: elementRequest } = req.body;
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const element = elementRequest === undefined
                ? undefined
                : await (0, createElement_1.createElement)(elementRequest, spinalAPIMiddleware, profileId);
            const node = new spinal_model_graph_1.SpinalNode(info.name, info.type, element);
            await (0, handleSetInfo_1.handleSetInfo)(node, info, spinalAPIMiddleware, profileId);
            await (0, handleSetAttribute_1.handleSetAttribute)(node, attributes);
            const errors = [];
            let attached = false;
            for (const [index, parent] of parents.entries()) {
                try {
                    const parentNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parent.parentDynamicId, profileId);
                    if (parent.contextDynamicId !== undefined) {
                        const context = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parent.contextDynamicId, profileId);
                        if (!(context instanceof spinal_model_graph_1.SpinalContext)) {
                            throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_LOAD_NODE_TYPE, `Node ${parent.contextDynamicId} is not a SpinalContext`);
                        }
                        await parentNode.addChildInContext(node, parent.relationName, parent.relationType, context);
                    }
                    else {
                        await parentNode.addChild(node, parent.relationName, parent.relationType);
                    }
                    attached = true;
                }
                catch (error) {
                    console.error(error);
                    const item = (0, createErrorMsgItem_1.isErrorItem)(error)
                        ? error
                        : (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INTERNAL_ERROR, "Unexpected error while attaching node to parent");
                    errors.push({ ...item, index, parent });
                }
            }
            if (!attached) {
                const internal = errors.some((error) => error.errorType === EApiErrorType_1.EApiErrorType.INTERNAL_ERROR);
                return res.status(internal ? 500 : 400).json({
                    ...(0, createErrorMsgItem_1.createErrorMsgItem)(internal
                        ? EApiErrorType_1.EApiErrorType.INTERNAL_ERROR
                        : EApiErrorType_1.EApiErrorType.INVALID_REQUEST, "No parent attachment succeeded"),
                    errors,
                });
            }
            const data = await (0, getNodeData_1.getNodeData)(node, true, true);
            return res.status(201).json({
                data,
                error: errors.length > 0 ? errors : undefined,
            });
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=createNode.js.map