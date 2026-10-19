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
const express_zod_safe_1 = __importDefault(require("express-zod-safe"));
const spinal_model_graph_1 = require("spinal-model-graph");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const getNodeData_1 = require("../../../utilities/v2/node/getNodeData");
const prepareNodeCreation_1 = require("../../../utilities/v2/node/prepareNodeCreation");
const createErrorMsgItem_1 = require("../../../utilities/v2/errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../../../utilities/v2/errorHandler/EApiErrorType");
const sendResponseError_1 = require("../../../utilities/v2/errorHandler/sendResponseError");
const schema_1 = require("../../../utilities/v2/node/creation/schema");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v2/context:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     tags: [context]
     *     summary: Create a context in the root and profile graphs
     *     description: |-
     *       Creates a `SpinalContext` from the supplied info and adds it to both the root graph and the current profile graph.
     *
     *       - The request body uses the same info, attributes and optional element fields as `POST /api/v2/node`. `parents` is not accepted.
     *       - The exact context name must not already exist in either profile and root graph. Name matching is case-sensitive.
     *
     *       ### Model references (`$modelRef`)
     *
     *       Info, element and attribute values may use `$modelRef` syntax, including `"self"` for the context being created. See `POST /api/v2/node` for usage examples and **`INodeElementModelReference`** for the full rules.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             additionalProperties: false
     *             required: [info]
     *             properties:
     *               info:
     *                 type: object
     *                 required: [name, type]
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
     *           example:
     *             info:
     *               name: Energy Analysis
     *               type: Analysis
     *             attributes:
     *               Settings:
     *                 enabled: "true"
     *             element:
     *               unit: kWh
     *     responses:
     *       201:
     *         description: Context created and added to both graphs.
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
     *       409:
     *         description: A context with the exact name already exists in the root or profile graph.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/IErrorItem'
     *       500:
     *         $ref: '#/components/responses/IErrorItemRes500'
     */
    app.post('/api/v2/context', (0, express_zod_safe_1.default)({ body: schema_1.createContextSchema }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const profileGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const rootGraph = await spinalAPIMiddleware.getGraph();
            if (!profileGraph || !rootGraph) {
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.ERROR_DATABASE, `No graph found for ${profileId}`);
            }
            const { info, attributes, element } = req.body;
            const existingInProfile = await profileGraph.getContext(info.name);
            const existingInRoot = profileGraph === rootGraph
                ? existingInProfile
                : await rootGraph.getContext(info.name);
            if (existingInProfile || existingInRoot) {
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.CONFLICT, `A context named "${info.name}" already exists`);
            }
            const prepared = await (0, prepareNodeCreation_1.prepareNodeCreation)(info.name, info.type, info, element, attributes, undefined, spinalAPIMiddleware, profileId);
            const context = new spinal_model_graph_1.SpinalContext(info.name, info.type, await prepared.getElement(true));
            await (0, prepareNodeCreation_1.applyPreparedNode)(context, prepared);
            await rootGraph.addContext(context);
            if (profileGraph !== rootGraph) {
                await profileGraph.addContext(context);
            }
            return res
                .status(201)
                .json({ data: await (0, getNodeData_1.getNodeData)(context, true, true) });
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=createContext.js.map