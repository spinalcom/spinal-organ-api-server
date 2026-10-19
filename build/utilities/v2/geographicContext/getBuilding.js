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
exports.getBuildingNode = getBuildingNode;
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const getSpatialContext_1 = require("../../getSpatialContext");
const createErrorMsgItem_1 = require("../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../errorHandler/EApiErrorType");
async function getBuildingNode(spinalAPIMiddleware, profileId, createContextIfNotFound = false) {
    let geographicContext;
    try {
        geographicContext = await (0, getSpatialContext_1.getSpatialContext)(spinalAPIMiddleware, profileId);
    }
    catch (error) { }
    if (!geographicContext) {
        if (!createContextIfNotFound) {
            throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.ERROR_DATABASE, 'Geographic context not found');
        }
        geographicContext = await (0, spinal_env_viewer_context_geographic_service_1.createContext)('spatial');
        const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
        const rootGraph = await spinalAPIMiddleware.getGraph();
        if (userGraph && userGraph !== rootGraph) {
            await userGraph.addContext(geographicContext);
        }
    }
    for await (const node of geographicContext.visitChildren([
        spinal_env_viewer_context_geographic_service_1.SITE_RELATION,
        spinal_env_viewer_context_geographic_service_1.BUILDING_RELATION,
    ])) {
        if (node.getType().get() === spinal_env_viewer_context_geographic_service_1.BUILDING_TYPE)
            return { geographicContext, building: node };
    }
    return { geographicContext, building: undefined };
}
//# sourceMappingURL=getBuilding.js.map