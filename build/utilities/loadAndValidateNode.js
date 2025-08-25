"use strict";
/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
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
exports.loadAndValidateNode = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
async function loadAndValidateNode(spinalAPIMiddleware, serverId, profileId, nodeType) {
    if (typeof serverId === 'number' ||
        (typeof serverId === 'string' && !isNaN(Number(serverId))))
        throw createErrorResponse(400, `Invalid dynamicId: ${serverId}`);
    const node = await safeLoadNode(spinalAPIMiddleware, serverId, profileId);
    if (!(node instanceof spinal_model_graph_1.SpinalNode))
        throw createErrorResponse(400, `Node ${serverId} is not a SpinalNode`);
    if (nodeType && node.info?.type?.get() !== nodeType)
        throw createErrorResponse(400, `Node ${serverId} is not of type ${nodeType}`);
    return node;
}
exports.loadAndValidateNode = loadAndValidateNode;
async function safeLoadNode(spinalAPIMiddleware, serverId, profileId) {
    try {
        return await spinalAPIMiddleware.load(serverId, profileId);
    }
    catch (error) {
        throw createErrorResponse(404, `Error : Loading node ${serverId} failed`);
    }
}
function createErrorResponse(code, message) {
    return { code, message };
}
//# sourceMappingURL=loadAndValidateNode.js.map