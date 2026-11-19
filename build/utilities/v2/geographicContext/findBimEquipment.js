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
exports.findBimEquipment = findBimEquipment;
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const loadAndValidateNode_1 = require("../../loadAndValidateNode");
const createErrorMsgItem_1 = require("../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../errorHandler/EApiErrorType");
async function findBimEquipment(middleware, profileId, bimFileId, dbid) {
    const graph = await middleware.getGraph();
    const contexts = await graph.getChildren();
    const fileContext = contexts.find((context) => context.info.name.get() === 'BimFileContext');
    const files = fileContext ? await fileContext.getChildren('hasBimFile') : [];
    const bimFile = files.find((file) => file.info.id.get() === bimFileId);
    if (!bimFile)
        throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, 'bimFileId given but NotFound');
    const bimContexts = await bimFile.getChildren('hasBimContext');
    for (const context of bimContexts) {
        const objects = await context.getChildren(spinal_env_viewer_context_geographic_service_1.EQUIPMENT_RELATION);
        for (const object of objects) {
            if (object.info.dbid?.get() !== dbid)
                continue;
            if (!object._server_id)
                throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INTERNAL_ERROR, 'BIM object has no dynamic ID');
            const equipment = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, object._server_id, profileId);
            return { bimFile, bimContext: context, equipment };
        }
    }
    return { bimFile, bimContext: bimContexts[0], equipment: undefined };
}
//# sourceMappingURL=findBimEquipment.js.map