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
const requestUtilities_1 = require("../../../../utilities/requestUtilities");
const parseAttributesQuery_1 = require("../../../../utilities/v2/requestParse/parseAttributesQuery");
const getNodeData_1 = require("../../../../utilities/v2/node/getNodeData");
const parseInfoQuery_1 = require("../../../../utilities/v2/requestParse/parseInfoQuery");
const sendResponseError_1 = require("../../../../utilities/v2/errorHandler/sendResponseError");
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const getNodeChildrenFromParentDynId_1 = require("../../../../utilities/v2/node/getNodeChildrenFromParentDynId");
const getSpatialContext_1 = require("../../../../utilities/getSpatialContext");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v2/room:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Retrieve room by it's dynamic ID
     *     description: Retrieve room by its dynamic ID.
     *     tags:
     *       - geographicContext
     *     parameters:
     *       - $ref: '#/components/parameters/queryInfo'
     *       - $ref: '#/components/parameters/queryAttributes'
     *       - $ref: '#/components/parameters/queryAddAttributesModificationDate'
     *       - $ref: '#/components/parameters/paramParentDynId'
     *     responses:
     *       200:
     *         $ref: '#/components/responses/INodeItemAttrMultiRes'
     *       400:
     *         $ref: '#/components/responses/IErrorItemRes400'
     */
    app.get('/api/v2/room', (0, express_zod_safe_1.default)({
        query: zod_1.z.strictObject({
            info: zod_1.z.coerce.string().optional().default('false'),
            attributes: zod_1.z.coerce.string().optional(),
            'add-attributes-modification-date': zod_1.z.stringbool().optional(),
            'parent-dynamic-id': zod_1.z.coerce.number().min(1).optional(),
        }),
    }), async (req, res) => {
        try {
            const { attributes, 'add-attributes-modification-date': addAttributesModificationDate, } = req.query;
            const parsedInfoQuery = (0, parseInfoQuery_1.parseInfoQuery)(req.query.info);
            const parsedAttrQuery = (0, parseAttributesQuery_1.parseAttributesQuery)(attributes);
            const { 'parent-dynamic-id': parentDynamicId } = req.query;
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            if (parentDynamicId) {
                const geographicContext = await (0, getSpatialContext_1.getSpatialContext)(spinalAPIMiddleware, profileId);
                const children = await (0, getNodeChildrenFromParentDynId_1.getNodeChildrenFromParentDynId)(spinalAPIMiddleware, parentDynamicId, profileId, spinal_env_viewer_context_geographic_service_1.ROOM_TYPE, [
                    {
                        relationName: spinal_env_viewer_context_geographic_service_1.ROOM_RELATION,
                        parentType: spinal_env_viewer_context_geographic_service_1.FLOOR_TYPE,
                        context: geographicContext,
                    },
                    {
                        relationName: `groupHas${spinal_env_viewer_context_geographic_service_1.ROOM_TYPE}`,
                        parentType: `${spinal_env_viewer_context_geographic_service_1.ROOM_TYPE}Group`,
                    },
                ]);
                // TO DO
                // filter query + pagination
                const roomData = await Promise.all(children.map((child) => (0, getNodeData_1.getNodeData)(child, parsedInfoQuery, parsedAttrQuery, addAttributesModificationDate, parentDynamicId)));
                return res.status(200).json({ data: roomData });
            }
            // If no parentDynamicId is provided, fetch all rooms within the geographic context
            const roomData = [];
            return res.status(200).json({ data: roomData });
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=getRoom.js.map