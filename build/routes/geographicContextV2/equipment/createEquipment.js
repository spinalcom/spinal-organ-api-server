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
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const getNodeData_1 = require("../models/getNodeData");
const getBuilding_1 = require("../../../utilities/geographicContext_v2/getBuilding");
const addExtraInfoValidation_1 = require("../../../utilities/geographicContext_v2/addExtraInfoValidation");
const addExtraAttrValidation_1 = require("../../../utilities/geographicContext_v2/addExtraAttrValidation");
const linkNodeToGroups_1 = require("../../../utilities/geographicContext_v2/linkNodeToGroups");
const handleSetAttribute_1 = require("../../../utilities/geographicContext_v2/handleSetAttribute");
const handleSetInfo_1 = require("../../../utilities/geographicContext_v2/handleSetInfo");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
const spinal_model_graph_1 = require("spinal-model-graph");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v2/equipment:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: create an equipment
     *     description: Create an equipment.
     *     tags:
     *       - geographicContext
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - dynamicRoomId
     *               - info
     *             properties:
     *               dynamicRoomId:
     *                 type: number
     *                 description: The dynamic ID of the floor to which the equipment belongs
     *                 minimum: 1
     *               info:
     *                 type: object
     *                 description: Information about the equipment, including its name, color, and icon. The following fields are forbidden 'id', 'staticId', 'type', 'dynamicId'
     *                 properties:
     *                   name:
     *                     type: string
     *                     description: name of the equipment
     *                     maxLength: 200
     *                     minLength: 1
     *                   color:
     *                     type: string
     *                     description:  Hexadecimal color code for the equipment (e.g., #RRGGBB)
     *                     pattern: "^#([A-Fa-f0-9]{6})$"
     *                   icon:
     *                     type: string
     *                     description: icon of the equipment
     *                   virtual:
     *                     type: boolean
     *                     description: status of the equipment (virtual or not)
     *                     default: false
     *                   dbid:
     *                     type: number
     *                     description: dbid of the equipment, for use in the APS Viewer
     *                   externalId:
     *                     type: string
     *                     description: External ID of the equipment comming from Revit
     *                   bimFileId:
     *                     type: string
     *                     description: staticId of the BimFile which the equipment belongs to
     *                   additionalProperties:
     *                     oneOf:
     *                       - type: string
     *                       - type: number
     *                       - type: boolean
     *                 required:
     *                   - name
     *               attributes:
     *                 type: object
     *                 description: add attributes to equipment
     *                 properties:
     *                   Spatial:
     *                     type: object
     *                     description: Spatial attributes category of the equipment
     *                     properties:
     *                       area:
     *                         type: string
     *                         description: Area of the equipment
     *                     additionalProperties:
     *                       type: string
     *                 additionalProperties:
     *                   type: object
     *                   additionalProperties:
     *                     type: string
     *               linkToGroups:
     *                 type: array
     *                 description: link the equipment to groups
     *                 items:
     *                   type: object
     *                   properties:
     *                     contextDynamicId:
     *                       type: number
     *                       minimum: 1
     *                     groupDynamicId:
     *                       type: number
     *                       minimum: 1
     *             example:
     *               dynamicRoomId: 123456789
     *               info:
     *                 name: "equipment Name"
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
     *                   type: object
     *       400:
     *         description: Bad request - Invalid input or parameters
     *       500:
     *         description: Internal server error
     */
    app.post('/api/v2/equipment', (0, express_zod_safe_1.default)({
        body: zod_1.z.object({
            dynamicRoomId: zod_1.z.number().min(1),
            info: (0, addExtraInfoValidation_1.addExtraInfoValidation)(zod_1.z.object({
                name: zod_1.z.string().min(1).max(200),
                color: zod_1.z
                    .string()
                    .regex(/^#([A-Fa-f0-9]{6})$/)
                    .optional(),
                icon: zod_1.z.string().min(1).max(200).optional(),
                virtual: zod_1.z.boolean().optional().default(false),
                dbid: zod_1.z.coerce.number().optional(),
                externalId: zod_1.z.string().min(1).max(200).optional(),
                bimFileId: zod_1.z.string().min(1).max(200).optional(),
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
            const { dynamicRoomId, info, attributes, linkToGroups } = req.body;
            const roomNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, dynamicRoomId, profileId, spinal_env_viewer_context_geographic_service_1.ROOM_TYPE);
            const oldEquipments = await roomNode.getChildrenInContext(geographicContext, spinal_env_viewer_context_geographic_service_1.EQUIPMENT_RELATION);
            for (const oldEquip of oldEquipments) {
                if (oldEquip.info.name.get() === info.name) {
                    return res
                        .status(400)
                        .send('An equipment with the same name already exists');
                }
            }
            const newEquipment = new spinal_model_graph_1.SpinalNode(info.name, spinal_env_viewer_context_geographic_service_1.EQUIPMENT_TYPE, undefined);
            await roomNode.addChildInContext(newEquipment, spinal_env_viewer_context_geographic_service_1.EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE, geographicContext);
            await (0, handleSetAttribute_1.handleSetAttribute)(newEquipment, attributes, undefined);
            (0, handleSetInfo_1.handleSetInfo)(newEquipment, info);
            const resObj = await (0, getNodeData_1.getNodeData)(newEquipment, true, true);
            if (Array.isArray(linkToGroups) && linkToGroups.length > 0) {
                const linkResult = await (0, linkNodeToGroups_1.linkNodeToGroups)(spinalAPIMiddleware, profileId, newEquipment, linkToGroups);
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
//# sourceMappingURL=createEquipment.js.map