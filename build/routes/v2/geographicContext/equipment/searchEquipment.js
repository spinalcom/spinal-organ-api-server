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
const groupByParent_1 = require("../../../../utilities/v2/node/groupByParent");
const getBuilding_1 = require("../../../../utilities/v2/geographicContext/getBuilding");
const findEquipmentNodes_1 = require("../../../../utilities/v2/geographicContext/findEquipmentNodes");
const parseParentDynIdList_1 = require("../../../../utilities/v2/requestParse/parseParentDynIdList");
const searchEquipmentSchema = zod_1.z.strictObject({
    info: zod_1.z.string().optional(),
    attributes: zod_1.z.string().optional(),
    addAttributesModificationDate: zod_1.z.boolean().optional(),
    parentDynamicIds: parseParentDynIdList_1.parentDynamicIdsBodySchema.optional(),
    bimObjectType: zod_1.z
        .enum(['bimobject', 'referenceRoom', 'referenceFloor'])
        .optional()
        .default('bimobject'),
    filter: zod_1.z.union([zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()), zod_1.z.string()]).optional(),
    offset: zod_1.z.number().int().min(0).optional().default(0),
    groupByParent: zod_1.z.boolean().optional().default(true),
});
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v2/equipment/search:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     summary: Search equipment
     *     description: |-
     *       Same behaviour as `GET /api/v2/equipment`, with options sent in a JSON body.
     *       Use this endpoint when the list of parents is too long for a query string.
     *
     *       - `parentDynamicIds` is an array of 1 to 50 parent dynamic IDs. Duplicates are ignored.
     *       - Omit `parentDynamicIds` to traverse the profile's building (not recommended for large buildings).
     *       - Filters use **AND**, run **before** `offset`, and return at most **200 matching items**.
     *       - Each item includes `parentDynamicId`.
     *       - With `parentDynamicIds`, `total` counts eligible children **before filtering** across all parents.
     *       - With `groupByParent: true`, the response returns `groups` instead of `data`: one entry per parent that has items in the page, in parent input order. Paging is still global, so a parent's items can continue on the next page. An equipment item linked to two parents appears in both groups.
     *     tags:
     *       - geographicContext
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             additionalProperties: false
     *             properties:
     *               info:
     *                 type: string
     *                 description: Same format as the `info` query parameter.
     *                 example: name,type
     *               attributes:
     *                 type: string
     *                 description: Same format as the `attributes` query parameter.
     *               addAttributesModificationDate:
     *                 type: boolean
     *               parentDynamicIds:
     *                 type: array
     *                 minItems: 1
     *                 maxItems: 50
     *                 items:
     *                   type: integer
     *                   minimum: 1
     *                 example: [132456, 132457]
     *               bimObjectType:
     *                 type: string
     *                 enum: ['bimobject', 'referenceRoom', 'referenceFloor']
     *                 default: 'bimobject'
     *               filter:
     *                 type: object
     *                 description: Same filter object as the `filter` query parameter.
     *                 example:
     *                   attributes.Geometry.Surface:
     *                     exists: true
     *               offset:
     *                 type: integer
     *                 minimum: 0
     *                 default: 0
     *               groupByParent:
     *                 type: boolean
     *                 default: true
     *                 description: Return `groups` (one per parent) by default. Set to `false` to get a flat `data` array.
     *     responses:
     *       200:
     *         $ref: '#/components/responses/INodeItemAttrMultiRes'
     *       400:
     *         $ref: '#/components/responses/IErrorItemRes400'
     *       500:
     *         $ref: '#/components/responses/IErrorItemRes500'
     */
    app.post('/api/v2/equipment/search', (0, express_zod_safe_1.default)({ body: searchEquipmentSchema }), async (req, res) => {
        try {
            const { info, attributes, addAttributesModificationDate, parentDynamicIds, bimObjectType, filter, offset, groupByParent, } = req.body;
            const parsedInfoQuery = (0, parseInfoQuery_1.parseInfoQuery)(info);
            const parsedAttrQuery = (0, parseAttributesQuery_1.parseAttributesQuery)(attributes);
            const filters = (0, parseFilterQuery_1.parseFilterQuery)({ filter });
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const { geographicContext, building } = await (0, getBuilding_1.getBuildingNode)(spinalAPIMiddleware, profileId, false);
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
            const total = Array.isArray(foundNodes) ? foundNodes.length : undefined;
            if (groupByParent) {
                return res.status(200).json({
                    groups: (0, groupByParent_1.groupPageByParent)(page, equipmentData),
                    offset,
                    total,
                });
            }
            return res.status(200).json({
                data: equipmentData,
                offset,
                total,
            });
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=searchEquipment.js.map