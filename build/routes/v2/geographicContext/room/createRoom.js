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
     *             properties:
     *               dynamicFloorId:
     *                 type: number
     *                 description: The dynamic ID of the floor to which the room belongs
     *                 minimum: 1
     *               info:
     *                 type: object
     *                 description: Information about the room, including its name, color, and icon. The following fields are forbidden 'id', 'staticId', 'type', 'dynamicId'
     *                 properties:
     *                   name:
     *                     type: string
     *                     description: name of the room
     *                     maxLength: 200
     *                     minLength: 1
     *                   color:
     *                     type: string
     *                     description:  Hexadecimal color code for the room (e.g., #RRGGBB)
     *                     pattern: "^#([A-Fa-f0-9]{6})$"
     *                   icon:
     *                     type: string
     *                     description: icon of the room
     *                   virtual:
     *                     type: boolean
     *                     description: status of the room (virtual or not)
     *                     default: false
     *                   additionalProperties:
     *                     oneOf:
     *                       - type: string
     *                       - type: number
     *                       - type: boolean
     *                 required:
     *                   - name
     *               attributes:
     *                 type: object
     *                 description: add attributes to room
     *                 properties:
     *                   Spatial:
     *                     type: object
     *                     description: Spatial attributes category of the room
     *                     properties:
     *                       area:
     *                         type: string
     *                         description: Area of the room
     *                     additionalProperties:
     *                       type: string
     *                 additionalProperties:
     *                   type: object
     *                   additionalProperties:
     *                     type: string
     *               linkToGroups:
     *                 type: array
     *                 description: link the room to groups
     *                 items:
     *                   type: object
     *                   properties:
     *                     contextDynamicId:
     *                       type: number
     *                       minimum: 1
     *                     groupDynamicId:
     *                       type: number
     *                       minimum: 1
     *             required:
     *               - dynamicFloorId
     *               - info
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
     *         description: Created Successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   $ref: '#/components/schemas/INodeItem'
     *                 error:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/IErrorItem'
     *       400:
     *         description: Bad request - Invalid input or parameters
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   $ref: '#/components/schemas/IErrorItem'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   $ref: '#/components/schemas/IErrorItem'
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