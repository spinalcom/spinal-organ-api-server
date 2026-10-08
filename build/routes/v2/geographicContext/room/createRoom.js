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
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const loadAndValidateNode_1 = require("../../../../utilities/loadAndValidateNode");
const addExtraAttrValidation_1 = require("../../../../utilities/v2/requestParse/addExtraAttrValidation");
const linkNodeToGroups_1 = require("../../../../utilities/v2/node/linkNodeToGroups");
const handleSetAttribute_1 = require("../../../../utilities/v2/node/handleSetAttribute");
const handleSetInfo_1 = require("../../../../utilities/v2/node/handleSetInfo");
const getNodeData_1 = require("../../../../utilities/v2/node/getNodeData");
const getBuilding_1 = require("../../../../utilities/v2/geographicContext/getBuilding");
const addExtraInfoValidation_1 = require("../../../../utilities/v2/requestParse/addExtraInfoValidation");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v2/room:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: create a room
     *     description: Create a room.
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
     *       500:
     *         $ref: '#/components/responses/IErrorItemRes500'
     */
    app.post('/api/v2/room', (0, express_zod_safe_1.default)({
        body: zod_1.z.object({
            dynamicFloorId: zod_1.z.number().min(1),
            info: (0, addExtraInfoValidation_1.addExtraInfoValidation)(zod_1.z.object({
                name: zod_1.z.string().min(1).max(200),
                color: zod_1.z
                    .string()
                    .regex(/^#([A-Fa-f0-9]{6})$/)
                    .optional(),
                icon: zod_1.z.string().min(1).max(200).optional(),
                virtual: zod_1.z.boolean().optional().default(false),
            }), ['id', 'staticId', 'dynamicId', 'type']),
            linkToGroups: zod_1.z
                .array(zod_1.z.strictObject({
                contextDynamicId: zod_1.z.number().min(1),
                groupDynamicId: zod_1.z.number().min(1),
            }))
                .optional(),
            attributes: (0, addExtraAttrValidation_1.addExtraCatAttrValidation)(zod_1.z.object({
                Spatial: (0, addExtraAttrValidation_1.addExtraAttrValidation)(zod_1.z.object({
                    area: zod_1.z.string().optional(),
                })).optional(),
            })).optional(),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const { geographicContext, building } = await (0, getBuilding_1.getBuildingNode)(spinalAPIMiddleware, profileId, false);
            if (!building)
                return res.status(404).send('Building not found');
            const { dynamicFloorId, info, attributes, linkToGroups } = req.body;
            const floorNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, dynamicFloorId, profileId, spinal_env_viewer_context_geographic_service_1.FLOOR_TYPE);
            const oldRooms = await floorNode.getChildrenInContext(geographicContext, spinal_env_viewer_context_geographic_service_1.ROOM_RELATION);
            for (const oldRoom of oldRooms) {
                if (oldRoom.info.name.get() === info.name) {
                    return res
                        .status(400)
                        .send('A room with the same name already exists');
                }
            }
            const newRoom = await (0, spinal_env_viewer_context_geographic_service_1.addRoom)(geographicContext, floorNode, info.name);
            await (0, handleSetAttribute_1.handleSetAttribute)(newRoom, attributes, {
                Spatial: {
                    area: '0',
                    category: 'Revit Pièces',
                },
            });
            (0, handleSetInfo_1.handleSetInfo)(newRoom, info);
            const resObj = await (0, getNodeData_1.getNodeData)(newRoom, true, true);
            if (Array.isArray(linkToGroups) && linkToGroups.length > 0) {
                const linkResult = await (0, linkNodeToGroups_1.linkNodeToGroups)(spinalAPIMiddleware, profileId, newRoom, linkToGroups);
                return res
                    .status(201)
                    .json({ data: resObj, error: linkResult.errors });
            }
            return res.status(201).json({ data: resObj });
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send('An unexpected error occurred while creating the room');
        }
    });
};
//# sourceMappingURL=createRoom.js.map