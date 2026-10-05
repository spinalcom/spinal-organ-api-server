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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v2/floor:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: create a floor
     *     description: Create a floor.
     *     tags:
     *       - geographicContext
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               info:
     *                 type: object
     *                 description: Information about the floor, including its name, color, and icon. The following fields are forbidden 'id', 'staticId', 'type', 'dynamicId'
     *                 properties:
     *                   name:
     *                     type: string
     *                     description: name of the floor
     *                     maxLength: 200
     *                     minLength: 1
     *                   color:
     *                     type: string
     *                     description:  Hexadecimal color code for the floor (e.g., #RRGGBB)
     *                     pattern: "^#([A-Fa-f0-9]{6})$"
     *                   icon:
     *                     type: string
     *                     description: icon of the floor
     *                   virtual:
     *                     type: boolean
     *                     description: status of the floor (virtual or not)
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
     *                 description: add attributes to floor
     *                 properties:
     *                   Spatial:
     *                     type: object
     *                     description: Spatial attributes category of the floor
     *                     properties:
     *                       area:
     *                         type: string
     *                         description: Area of the floor
     *                     additionalProperties:
     *                       type: string
     *                 additionalProperties:
     *                   type: object
     *                   additionalProperties:
     *                     type: string
     *               linkToGroups:
     *                 type: array
     *                 description: link the floor to groups
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
     *               - info
     *             example:
     *               info:
     *                 name: "Floor Name"
     *                 color: "#FF0000"
     *                 icon: "floor-icon"
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
    app.post('/api/v2/floor', (0, express_zod_safe_1.default)({
        body: zod_1.z.object({
            info: (0, addExtraInfoValidation_1.addExtraInfoValidation)(zod_1.z.object({
                name: zod_1.z.string().min(1).max(200),
                color: zod_1.z
                    .string()
                    .regex(/^#([A-Fa-f0-9]{6})$/)
                    .optional(),
                icon: zod_1.z.string().min(1).max(200).optional(),
                virtual: zod_1.z.boolean().optional().default(false),
            }), ['id', 'staticId', 'type', 'dynamicId']),
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
            const { info, attributes, linkToGroups } = req.body;
            const oldFloors = await building.getChildrenInContext(geographicContext, spinal_env_viewer_context_geographic_service_1.FLOOR_RELATION);
            for (const oldFloor of oldFloors) {
                if (oldFloor.info.name.get() === info.name) {
                    return res
                        .status(400)
                        .send('A floor with the same name already exists');
                }
            }
            const newFloor = await (0, spinal_env_viewer_context_geographic_service_1.addFloor)(geographicContext, building, info.name);
            await (0, handleSetAttribute_1.handleSetAttribute)(newFloor, attributes, {
                Spatial: {
                    category: 'Revit Level',
                    area: '0',
                },
            });
            (0, handleSetInfo_1.handleSetInfo)(newFloor, info);
            const resObj = await (0, getNodeData_1.getNodeData)(newFloor, true, true);
            if (Array.isArray(linkToGroups) && linkToGroups.length > 0) {
                const linkResult = await (0, linkNodeToGroups_1.linkNodeToGroups)(spinalAPIMiddleware, profileId, newFloor, linkToGroups);
                return res.status(201).json({
                    data: resObj,
                    error: linkResult.errors.length > 0 ? linkResult.errors : undefined,
                });
            }
            return res.status(201).json({ data: resObj });
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res
                .status(500)
                .send('An unexpected error occurred while creating the floor');
        }
    });
};
//# sourceMappingURL=createFloor.js.map