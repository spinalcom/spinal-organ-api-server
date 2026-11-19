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
Object.defineProperty(exports, "__esModule", { value: true });
exports.findEquipmentNodes = findEquipmentNodes;
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const getNodeChildrenFromParentDynId_1 = require("../node/getNodeChildrenFromParentDynId");
const getEquipmentInContextIterable_1 = require("./getEquipmentInContextIterable");
const createErrorMsgItem_1 = require("../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../errorHandler/EApiErrorType");
/**
 * Returns an array when parents are supplied (so the caller can compute `total`),
 * otherwise a lazy iterable over the whole building.
 */
async function findEquipmentNodes({ spinalAPIMiddleware, profileId, geographicContext, building, bimObjectType, parentDynamicIds, }) {
    if (parentDynamicIds) {
        let relationObj;
        if (bimObjectType === 'bimobject') {
            relationObj = {
                relationName: spinal_env_viewer_context_geographic_service_1.EQUIPMENT_RELATION,
                parentType: spinal_env_viewer_context_geographic_service_1.ROOM_TYPE,
                context: geographicContext,
            };
        }
        else if (bimObjectType === 'referenceRoom') {
            relationObj = {
                relationName: spinal_env_viewer_context_geographic_service_1.REFERENCE_ROOM_RELATION,
                parentType: spinal_env_viewer_context_geographic_service_1.ROOM_TYPE,
            };
        }
        else if (bimObjectType === 'referenceFloor') {
            relationObj = {
                relationName: spinal_env_viewer_context_geographic_service_1.REFERENCE_RELATION,
                parentType: spinal_env_viewer_context_geographic_service_1.FLOOR_TYPE,
                context: geographicContext,
            };
        }
        if (!relationObj)
            throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.ERROR_DATABASE, 'No valid relation found for the given bimObjectType');
        return (0, getNodeChildrenFromParentDynId_1.getNodeChildrenFromParentDynIds)(spinalAPIMiddleware, parentDynamicIds, profileId, spinal_env_viewer_context_geographic_service_1.EQUIPMENT_TYPE, [
            relationObj,
            {
                relationName: `groupHas${spinal_env_viewer_context_geographic_service_1.EQUIPMENT_TYPE}`,
                parentType: `${spinal_env_viewer_context_geographic_service_1.EQUIPMENT_TYPE}Group`,
            },
        ]);
    }
    if (!building) {
        throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.ERROR_DATABASE, 'No building found in database');
    }
    return (0, getEquipmentInContextIterable_1.getEquipmentInContextIterable)(geographicContext, building, bimObjectType);
}
//# sourceMappingURL=findEquipmentNodes.js.map