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
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const prepareNodeCreation_1 = require("../../../../utilities/v2/node/prepareNodeCreation");
const express_zod_safe_1 = __importDefault(require("express-zod-safe"));
const requestUtilities_1 = require("../../../../utilities/requestUtilities");
const spinal_env_viewer_context_geographic_service_2 = require("spinal-env-viewer-context-geographic-service");
const loadAndValidateNode_1 = require("../../../../utilities/loadAndValidateNode");
const createSchemas_1 = require("../../../../utilities/v2/geographicContext/createSchemas");
const linkNodeToGroups_1 = require("../../../../utilities/v2/node/linkNodeToGroups");
const getNodeData_1 = require("../../../../utilities/v2/node/getNodeData");
const getBuilding_1 = require("../../../../utilities/v2/geographicContext/getBuilding");
const createErrorMsgItem_1 = require("../../../../utilities/v2/errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../../../../utilities/v2/errorHandler/EApiErrorType");
const sendResponseError_1 = require("../../../../utilities/v2/errorHandler/sendResponseError");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v2/room:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Create a room
     *     description: |-
     *       Create a room under the floor identified by `dynamicFloorId`, using the profile's spatial context.
     *
     *       ### Info, attributes and model references
     *
     *       See `POST /api/v2/node` for more about info, categorized attributes and `$modelRef` usage. Additional info and attribute values may reference Models, including `"self"` for the room being created. See **`INodeElementModelReference`** for full reference rules. This endpoint assigns the node type and uses `dynamicFloorId` to select the parent; it does not accept `element` or `parents`.
     *
     *       ### Requirements
     *
     *       - A building must exist.
     *       - The room name must be unique within the floor.
     *
     *       ### Defaults
     *
     *       - `virtual`: `false`.
     *       - `Spatial.area`: `"0"`.
     *       - `Spatial.category`: `"Revit Pièces"`.
     *       - Supplied values override these defaults.
     *
     *       ### Response
     *
     *       - Returns all info (including nested objects and arrays) and attributes.
     *       - Optional group linking happens after creation. Failures **do not roll back** the room.
     *     tags:
     *       - geographicContext
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - dynamicFloorId
     *               - info
     *             properties:
     *               dynamicFloorId:
     *                 type: number
     *                 description: The dynamic ID of the floor to which the room belongs
     *                 minimum: 1
     *               info:
     *                 allOf:
     *                   - $ref: '#/components/schemas/ICreateNodeInfo'
     *                   - $ref: '#/components/schemas/INodeItemInfoPropVirtual'
     *               attributes:
     *                 allOf:
     *                   - $ref: '#/components/schemas/ICreateNodeItemAttr'
     *                   - $ref: '#/components/schemas/ICreateNodeItemAttrSpatialCat'
     *               linkToGroups:
     *                 $ref: '#/components/schemas/ICreateNodeLinkToGroups'
     *             example:
     *               dynamicFloorId: 123456789
     *               info:
     *                 name: "Room Name"
     *                 color: "#FF0000"
     *                 icon: "room-icon"
     *               attributes:
     *                 Spatial:
     *                   area: "20"
     *     responses:
     *       201:
     *         $ref: '#/components/responses/INodeItemAttrRes'
     *       400:
     *         $ref: '#/components/responses/IErrorItemRes400'
     *       409:
     *         description: A room with the same name already exists within the floor.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/IErrorItem'
     *       500:
     *         $ref: '#/components/responses/IErrorItemRes500'
     */
    app.post('/api/v2/room', (0, express_zod_safe_1.default)({
        body: createSchemas_1.createRoomSchema,
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const { geographicContext, building } = await (0, getBuilding_1.getBuildingNode)(spinalAPIMiddleware, profileId, false);
            if (!building)
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.ERROR_DATABASE, 'No building found in database');
            const { dynamicFloorId, info, attributes, linkToGroups } = req.body;
            const floorNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, dynamicFloorId, profileId, spinal_env_viewer_context_geographic_service_2.FLOOR_TYPE);
            const oldRooms = await floorNode.getChildrenInContext(geographicContext, spinal_env_viewer_context_geographic_service_2.ROOM_RELATION);
            for (const oldRoom of oldRooms) {
                if (oldRoom.info.name.get() === info.name) {
                    throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.CONFLICT, 'A room with the same name already exists');
                }
            }
            const prepared = await (0, prepareNodeCreation_1.prepareNodeCreation)(info.name, spinal_env_viewer_context_geographic_service_1.ROOM_TYPE, info, undefined, attributes, { Spatial: { area: '0', category: 'Revit Pièces' } }, spinalAPIMiddleware, profileId);
            const newRoom = await (0, spinal_env_viewer_context_geographic_service_2.addRoom)(geographicContext, floorNode, info.name);
            await (0, prepareNodeCreation_1.applyPreparedNode)(newRoom, prepared);
            const resObj = await (0, getNodeData_1.getNodeData)(newRoom, true, true);
            if (Array.isArray(linkToGroups) && linkToGroups.length > 0) {
                const linkResult = await (0, linkNodeToGroups_1.linkNodeToGroups)(spinalAPIMiddleware, profileId, newRoom, linkToGroups);
                return res.status(201).json({
                    data: resObj,
                    error: linkResult.errors.length > 0 ? linkResult.errors : undefined,
                });
            }
            return res.status(201).json({ data: resObj });
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=createRoom.js.map