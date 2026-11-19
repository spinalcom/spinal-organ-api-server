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
const parseFilterQuery_1 = require("../../../../utilities/v2/requestParse/parseFilterQuery");
const filterNodes_1 = require("../../../../utilities/v2/node/filterNodes");
const getBuilding_1 = require("../../../../utilities/v2/geographicContext/getBuilding");
const findEquipmentNodes_1 = require("../../../../utilities/v2/geographicContext/findEquipmentNodes");
const parseParentDynIdList_1 = require("../../../../utilities/v2/requestParse/parseParentDynIdList");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v2/equipment:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Retrieve equipment
     *     description: |-
     *       Retrieve equipment from the profile's building or from a supplied parent.
     *
     *       > **Performance recommendation:** provide `parent-dynamic-id`.
     *       > Running this endpoint without it is **not recommended**, especially for large buildings,
     *       > because it may traverse many floors, rooms and equipment nodes. Filters and the
     *       > 200-item page limit do not guarantee a small traversal.
     *       >
     *       > `parent-dynamic-id` accepts a comma-separated list. For a JSON body, use `POST /api/v2/equipment/search`.
     *
     *       ### Scope
     *
     *       - `bimobject`: regular equipment under a `geographicRoom`.
     *       - `referenceRoom`: reference objects under a `geographicRoom`.
     *       - `referenceFloor`: reference objects under a `geographicFloor`.
     *       - A `BIMObjectGroup` parent supports every `bimObjectType`.
     *
     *       ### Filtering and pagination
     *
     *       - All filter conditions use **AND**.
     *       - Filtering runs **before** `offset` and output projection.
     *       - Returns at most **200 matching items**. Use `offset=200` for the second page.
     *
     *       ### Response
     *
     *       - Each item includes `parentDynamicId`.
     *       - Equipment linked to multiple rooms may appear once per room.
     *       - With a parent parameter, `total` counts eligible children **before filtering**.
     *       - `total` is omitted for building-wide traversal.
     *
     *       ### Example
     *
     *       ```http
     *       GET /api/v2/equipment?parent-dynamic-id=132456&filter[attributes.Geometry.Surface][exists]=true&offset=0
     *       ```
     *     tags:
     *       - geographicContext
     *     parameters:
     *       - $ref: '#/components/parameters/queryInfo'
     *       - $ref: '#/components/parameters/queryAttributes'
     *       - $ref: '#/components/parameters/queryAddAttributesModificationDate'
     *       - $ref: '#/components/parameters/paramParentDynId'
     *       - in: query
     *         name: bimObjectType
     *         description: |-
     *           Select the **relation to traverse**, not a different node type:
     *
     *           - `bimobject`: regular room equipment (default).
     *           - `referenceRoom`: room reference objects.
     *           - `referenceFloor`: floor reference objects.
     *
     *           Ignored when the supplied parent is a `BIMObjectGroup`.
     *         schema:
     *           type: string
     *           enum: ['bimobject', 'referenceRoom', 'referenceFloor']
     *           default: 'bimobject'
     *       - $ref: '#/components/parameters/queryFilter'
     *       - $ref: '#/components/parameters/queryOffset'
     *     responses:
     *       200:
     *         $ref: '#/components/responses/INodeItemAttrMultiRes'
     *       400:
     *         $ref: '#/components/responses/IErrorItemRes400'
     *       500:
     *         $ref: '#/components/responses/IErrorItemRes500'
     */
    app.get('/api/v2/equipment', (0, express_zod_safe_1.default)({
        query: zod_1.z.strictObject({
            info: zod_1.z.coerce.string().optional(),
            attributes: zod_1.z.coerce.string().optional(),
            'add-attributes-modification-date': zod_1.z.stringbool().optional(),
            'parent-dynamic-id': parseParentDynIdList_1.parentDynamicIdsQuerySchema.optional(),
            bimObjectType: zod_1.z
                .enum(['bimobject', 'referenceRoom', 'referenceFloor'])
                .optional()
                .default('bimobject'),
            filter: zod_1.z
                .union([zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()), zod_1.z.string()])
                .optional(),
            offset: zod_1.z.coerce.number().min(0).optional().default(0),
        }),
    }), async (req, res) => {
        try {
            const { attributes, 'add-attributes-modification-date': addAttributesModificationDate, } = req.query;
            const parsedInfoQuery = (0, parseInfoQuery_1.parseInfoQuery)(req.query.info);
            const parsedAttrQuery = (0, parseAttributesQuery_1.parseAttributesQuery)(attributes);
            const filters = (0, parseFilterQuery_1.parseFilterQuery)(req.query);
            const { offset } = req.query;
            const { 'parent-dynamic-id': parentDynamicIds } = req.query;
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const { geographicContext, building } = await (0, getBuilding_1.getBuildingNode)(spinalAPIMiddleware, profileId, false);
            const { bimObjectType } = req.query;
            const foundNodes = await (0, findEquipmentNodes_1.findEquipmentNodes)({
                spinalAPIMiddleware,
                profileId,
                geographicContext,
                building,
                bimObjectType,
                parentDynamicIds,
            });
            const page = await (0, filterNodes_1.filterNodes)(foundNodes, filters, offset);
            const equipmentData = await Promise.all(page.map(({ node, parentId }) => (0, getNodeData_1.getNodeData)(node, parsedInfoQuery, parsedAttrQuery, addAttributesModificationDate, parentId)));
            return res
                .status(200)
                .json({
                data: equipmentData,
                offset,
                total: Array.isArray(foundNodes) ? foundNodes.length : undefined,
            });
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=getEquipment.js.map