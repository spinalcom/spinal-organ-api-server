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
const getBuilding_1 = require("../../../../utilities/v2/geographicContext/getBuilding");
const parseInfoQuery_1 = require("../../../../utilities/v2/requestParse/parseInfoQuery");
const createErrorMsgItem_1 = require("../../../../utilities/v2/errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../../../../utilities/v2/errorHandler/EApiErrorType");
const sendResponseError_1 = require("../../../../utilities/v2/errorHandler/sendResponseError");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v2/building:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Retrieve the building
     *     description: Retrieve a building.
     *     tags:
     *       - geographicContext
     *     parameters:
     *       - in: query
     *         name: info
     *         required: false
     *         description: Add fields information to the response. Can be "true" or a comma-separated list like "staticId,name". "true" will include all fields and in the latter case, "false" or omitting the parameter will include the default fields if present ('staticId','name', 'type', 'color', 'icon', 'virtual', 'bimFileId', 'dbid'),
     *         schema:
     *           type: string
     *         example: false
     *       - in: query
     *         name: attributes
     *         required: false
     *         description: Add attributes to the response. Can be "true" or a comma-separated list like "Spatial/area,Spatial/volume,OtherCategories". "true" will include all attributes from all categories and in the latter case, inputting only the category will include all the attributes within that category. "false" or omitting the parameter will include no attributes.
     *         schema:
     *           type: string
     *         example: true
     *       - in: query
     *         name: add-attributes-modification-date
     *         required: false
     *         description: add the modification date of the attributes
     *         example: ""
     *         schema:
     *           type: boolean
     *           default: false
     *     responses:
     *       200:
     *         description: Retrieve Successfully
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
     *               $ref: '#/components/schemas/IErrorItem'
     */
    app.get('/api/v2/building', (0, express_zod_safe_1.default)({
        query: zod_1.z.strictObject({
            info: zod_1.z.coerce.string().optional().default('false'),
            attributes: zod_1.z.coerce.string().optional(),
            'add-attributes-modification-date': zod_1.z.stringbool().optional(),
        }),
    }), async (req, res) => {
        try {
            const { attributes, 'add-attributes-modification-date': addAttributesModificationDate, } = req.query;
            const parsedInfoQuery = (0, parseInfoQuery_1.parseInfoQuery)(req.query.info);
            const parsedAttrQuery = (0, parseAttributesQuery_1.parseAttributesQuery)(attributes);
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const { building } = await (0, getBuilding_1.getBuildingNode)(spinalAPIMiddleware, profileId, true);
            if (!building)
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.ERROR_DATABASE, 'No building found in database');
            const data = await (0, getNodeData_1.getNodeData)(building, parsedInfoQuery, parsedAttrQuery, addAttributesModificationDate);
            return res.status(200).json({ data });
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=getBuilding.js.map