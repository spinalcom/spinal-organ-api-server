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
const prepareNodeCreation_1 = require("../../../../utilities/v2/node/prepareNodeCreation");
const express_zod_safe_1 = __importDefault(require("express-zod-safe"));
const requestUtilities_1 = require("../../../../utilities/requestUtilities");
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const getNodeData_1 = require("../../../../utilities/v2/node/getNodeData");
const getBuilding_1 = require("../../../../utilities/v2/geographicContext/getBuilding");
const createSchemas_1 = require("../../../../utilities/v2/geographicContext/createSchemas");
const linkNodeToGroups_1 = require("../../../../utilities/v2/node/linkNodeToGroups");
const loadAndValidateNode_1 = require("../../../../utilities/loadAndValidateNode");
const spinal_model_graph_1 = require("spinal-model-graph");
const findBimEquipment_1 = require("../../../../utilities/v2/geographicContext/findBimEquipment");
const patchNode_1 = require("../../../../utilities/v2/node/patchNode");
const createErrorMsgItem_1 = require("../../../../utilities/v2/errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../../../../utilities/v2/errorHandler/EApiErrorType");
const sendResponseError_1 = require("../../../../utilities/v2/errorHandler/sendResponseError");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v2/equipment:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Create equipment
     *     description: |-
     *       Create a BIMObject under a room, or a reference object under a room or floor.
     *
     *       ### Info, attributes and model references
     *
     *       See `POST /api/v2/node` for more about info, categorized attributes and `$modelRef` usage. Additional info and attribute values may reference Models. See **`INodeElementModelReference`** for full reference rules. This endpoint assigns the node type and uses `parentDynamicId` to select the parent; it does not accept `element` or `parents`.
     *
     *       ### Requirements
     *
     *       - A building must exist in the profile's spatial context.
     *       - Names must be unique among children of the selected equipment/reference relation.
     *       - Regular equipment requires a room parent.
     *       - With `isRefObject=true`, the parent may be a room or a floor.
     *       - New equipment/reference attachments use `PtrLst`. Existing `PtrLst` or `LstPtr` links to a reused BIM object are retained without migration or duplicate attachment.
     *
     *       ### Defaults
     *
     *       - `virtual`: `false`.
     *       - No default attributes are added.
     *
     *       ### BIM object reuse
     *
     *       When both `info.dbid` and `info.bimFileId` are supplied, reuse an existing equipment in that BIM file with the matching dbid. If none matches, create a new equipment. A missing BIM file returns HTTP 400.
     *
     *       ### Response
     *
     *       - Returns all info (including nested objects and arrays) and attributes.
     *       - Optional group linking happens after creation. Failures **do not roll back** the equipment.
     *     tags:
     *       - geographicContext
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - parentDynamicId
     *               - info
     *             properties:
     *               parentDynamicId:
     *                 type: number
     *                 description: Dynamic ID of a geographicRoom parent, or a geographicFloor parent when isRefObject=true.
     *                 minimum: 1
     *               isRefObject:
     *                 type: boolean
     *                 description: Use a room reference relation or floor reference relation instead of the regular equipment relation.
     *                 default: false
     *               info:
     *                 allOf:
     *                   - $ref: '#/components/schemas/ICreateNodeInfo'
     *                   - $ref: '#/components/schemas/INodeItemInfoPropVirtual'
     *                   - type: object
     *                     properties:
     *                       dbid:
     *                         type: number
     *                         description: Numeric dbid of the equipment for use in the APS Viewer.
     *                       externalId:
     *                         type: string
     *                         description: External ID of the equipment from Revit.
     *                       bimFileId:
     *                         type: string
     *                         description: Static ID of the BIM file to which the equipment belongs.
     *               attributes:
     *                 $ref: '#/components/schemas/ICreateNodeItemAttr'
     *               linkToGroups:
     *                 $ref: '#/components/schemas/ICreateNodeLinkToGroups'
     *             example:
     *               parentDynamicId: 123456789
     *               info:
     *                 name: "equipment Name"
     *                 color: "#FF0000"
     *                 icon: "room-icon"
     *                 dbid: 123
     *                 externalId: "external-id"
     *                 bimFileId: "123-abc-123-abc-456789"
     *     responses:
     *       201:
     *         $ref: '#/components/responses/INodeItemAttrRes'
     *       400:
     *         $ref: '#/components/responses/IErrorItemRes400'
     *       409:
     *         description: An equipment with the same name already exists for the selected parent and relation.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/IErrorItem'
     *       500:
     *         $ref: '#/components/responses/IErrorItemRes500'
     */
    app.post('/api/v2/equipment', (0, express_zod_safe_1.default)({
        body: createSchemas_1.createEquipmentSchema,
    }), async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const { geographicContext, building } = await (0, getBuilding_1.getBuildingNode)(spinalAPIMiddleware, profileId, false);
            if (!building)
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.ERROR_DATABASE, 'No building found in database');
            const { parentDynamicId, info, attributes, linkToGroups, isRefObject } = req.body;
            let relationParentToChild = spinal_env_viewer_context_geographic_service_1.EQUIPMENT_RELATION;
            const parentNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parentDynamicId, profileId);
            const parentType = parentNode.info.type.get();
            if (isRefObject) {
                if (parentType === spinal_env_viewer_context_geographic_service_1.FLOOR_TYPE) {
                    relationParentToChild = spinal_env_viewer_context_geographic_service_1.REFERENCE_RELATION;
                }
                else if (parentType === spinal_env_viewer_context_geographic_service_1.ROOM_TYPE) {
                    relationParentToChild = spinal_env_viewer_context_geographic_service_1.REFERENCE_ROOM_RELATION;
                }
                else {
                    throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_LOAD_NODE_TYPE, 'Invalid parent type for a reference object');
                }
            }
            else if (parentType !== spinal_env_viewer_context_geographic_service_1.ROOM_TYPE) {
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_LOAD_NODE_TYPE, 'Invalid parent type for an equipment');
            }
            const oldEquipments = await parentNode.getChildren(relationParentToChild);
            const bim = info.bimFileId !== undefined && info.dbid !== undefined
                ? await (0, findBimEquipment_1.findBimEquipment)(spinalAPIMiddleware, profileId, info.bimFileId, info.dbid)
                : undefined;
            for (const oldEquip of oldEquipments) {
                if (oldEquip.info.name.get() === info.name &&
                    oldEquip.getId().get() !== bim?.equipment?.getId().get()) {
                    throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.CONFLICT, 'An equipment with the same name already exists');
                }
            }
            const existingRelations = [
                spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE,
                spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE,
            ].flatMap((type) => {
                const relation = parentNode.children
                    .getElement(type)
                    ?.getElement(relationParentToChild);
                return relation &&
                    bim?.equipment &&
                    relation.getChildrenIds().includes(bim.equipment.getId().get())
                    ? [relation]
                    : [];
            });
            const alreadyAttached = existingRelations.length > 0;
            if (alreadyAttached &&
                !isRefObject &&
                !(existingRelations.some((relation) => relation.belongsToContext(geographicContext)) && bim.equipment.belongsToContext(geographicContext)))
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, 'Equipment is already attached but not in the geographic context');
            let newEquipment;
            if (bim?.equipment) {
                newEquipment = bim.equipment;
                await (0, patchNode_1.patchNode)(newEquipment, patchNode_1.patchNodeSchema.parse({
                    info: { set: info },
                    ...(attributes ? { attributes: { set: attributes } } : {}),
                }), spinalAPIMiddleware, profileId);
            }
            else {
                newEquipment = await (0, prepareNodeCreation_1.prepareNodeCreation)(info.name, spinal_env_viewer_context_geographic_service_1.EQUIPMENT_TYPE, { ...info, virtual: info.virtual ?? false }, undefined, attributes, undefined, spinalAPIMiddleware, profileId);
                if (bim) {
                    let bimContextNode = bim.bimContext;
                    if (!bimContextNode) {
                        bimContextNode = new spinal_model_graph_1.SpinalNode('BIMContext', 'SpinalNode');
                        await bim.bimFile.addChild(bimContextNode, 'hasBimContext', spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
                    }
                    await bimContextNode.addChild(newEquipment, spinal_env_viewer_context_geographic_service_1.EQUIPMENT_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
                }
            }
            if (!alreadyAttached && isRefObject) {
                await parentNode.addChild(newEquipment, relationParentToChild, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
            }
            else if (!alreadyAttached) {
                await parentNode.addChildInContext(newEquipment, relationParentToChild, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, geographicContext);
            }
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
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=createEquipment.js.map