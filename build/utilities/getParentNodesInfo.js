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
exports.getParentNodesInfo = void 0;
async function getParentNodesInfo(spinalAPIMiddleware, profileId, dynamicId, relations, contextId) {
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    let contextNode = undefined;
    if (contextId) {
        contextNode = await spinalAPIMiddleware.load(contextId, profileId);
    }
    let parents;
    if (contextNode) {
        // children = await node.getChildrenInContext(contextNode, )
        parents = await node.getParentsInContext(contextNode, relations);
    }
    else {
        parents = await node.getParents(relations);
    }
    const parentsInfo = [];
    for (const parent of parents) {
        const info = {
            dynamicId: parent._server_id,
            staticId: parent.getId().get(),
            name: parent.getName().get(),
            type: parent.getType().get(),
        };
        parentsInfo.push(info);
    }
    return parentsInfo;
}
exports.getParentNodesInfo = getParentNodesInfo;
exports.default = getParentNodesInfo;
//# sourceMappingURL=getParentNodesInfo.js.map