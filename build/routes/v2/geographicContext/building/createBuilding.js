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
const getNodeData_1 = require("../../../../utilities/v2/node/getNodeData");
const getBuilding_1 = require("../../../../utilities/v2/geographicContext/getBuilding");
const addExtraInfoValidation_1 = require("../../../../utilities/v2/requestParse/addExtraInfoValidation");
const addExtraAttrValidation_1 = require("../../../../utilities/v2/requestParse/addExtraAttrValidation");
const handleSetAttribute_1 = require("../../../../utilities/v2/node/handleSetAttribute");
const handleSetInfo_1 = require("../../../../utilities/v2/node/handleSetInfo");
const EApiErrorType_1 = require("../../../../utilities/v2/errorHandler/EApiErrorType");
const createErrorMsgItem_1 = require("../../../../utilities/v2/errorHandler/createErrorMsgItem");
const sendResponseError_1 = require("../../../../utilities/v2/errorHandler/sendResponseError");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**s
     * @swagger
     * /api/v2/building:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: create the building
     *     description: Create a building.
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
     *                 description: Information about the building, including its name, color, and icon. the following fields are forbidden 'id', 'staticId', 'type', 'dynamicId'
     *                 required:
     *                   - name
     *                 properties:
     *                   name:
     *                     type: string
     *                     description: name of the building
     *                     maxLength: 200
     *                     minLength: 1
     *                   color:
     *                     type: string
     *                     description:  Hexadecimal color code for the building (e.g., #RRGGBB)
     *                     pattern: "^#([A-Fa-f0-9]{6})$"
     *                   icon:
     *                     type: string
     *                     description: icon of the building
     *                   additionalProperties:
     *                     oneOf:
     *                       - type: string
     *                       - type: number
     *                       - type: boolean
     *               attributes:
     *                 type: object
     *                 description: add attributes to building
     *                 properties:
     *                   Spatial:
     *                     type: object
     *                     description: Spatial attributes category of the building
     *                     properties:
     *                       area:
     *                         type: string
     *                         description: Area of the building
     *                   Spinal Building Information:
     *                     type: object
     *                     description: Spinal Building Information attribute category of the building
     *                     properties:
     *                       area:
     *                         type: string
     *                         description: Area of the building
     *                     additionalProperties:
     *                       type: string
     *                 additionalProperties:
     *                   type: object
     *                   additionalProperties:
     *                     type: string
     *             required:
     *               - info
     *             example:
     *               info:
     *                 name: "Building Name"
     *                 color: "#FF0000"
     *                 icon: "building-icon"
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
    app.post('/api/v2/building', (0, express_zod_safe_1.default)({
        body: zod_1.z.object({
            info: (0, addExtraInfoValidation_1.addExtraInfoValidation)(zod_1.z.object({
                name: zod_1.z.string().min(1).max(200),
                color: zod_1.z
                    .string()
                    .regex(/^#([A-Fa-f0-9]{6})$/)
                    .optional(),
                icon: zod_1.z.string().min(1).max(200).optional(),
            }), ['id', 'staticId', 'type', 'dynamicId']),
            attributes: (0, addExtraAttrValidation_1.addExtraCatAttrValidation)(zod_1.z.object({
                'Spinal Building Information': (0, addExtraAttrValidation_1.addExtraAttrValidation)(zod_1.z.object({
                    Adresse: zod_1.z.string().optional(),
                })).optional(),
                Spatial: (0, addExtraAttrValidation_1.addExtraAttrValidation)(zod_1.z.object({
                    area: zod_1.z.string().optional(),
                })).optional(),
            })).optional(),
        }),
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const { geographicContext, building: buildingOld } = await (0, getBuilding_1.getBuildingNode)(spinalAPIMiddleware, profileId, true);
            if (buildingOld)
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.ERROR_DATABASE, 'A building already exists');
            const { info, attributes } = req.body;
            const newBuilding = await (0, spinal_env_viewer_context_geographic_service_1.addBuilding)(geographicContext, geographicContext, info.name);
            await (0, handleSetAttribute_1.handleSetAttribute)(newBuilding, attributes, {
                'Spinal Building Information': {
                    Adresse: 'To configure',
                },
                Spatial: {
                    area: '0',
                },
            });
            (0, handleSetInfo_1.handleSetInfo)(newBuilding, info);
            const resObj = await (0, getNodeData_1.getNodeData)(newBuilding, true, true);
            return res.status(201).json({ data: resObj });
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=createBuilding.js.map