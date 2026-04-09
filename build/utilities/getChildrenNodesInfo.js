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
exports.getChildrenNodesInfo = void 0;
async function getChildrenNodesInfo(spinalAPIMiddleware, profileId, dynamicId, relations, contextId) {
    // if we have a contextId we will get the children in the context.
    // Additionally , if we have relations we will restrict the children to the relations
    const contextNode = contextId
        ? await spinalAPIMiddleware.load(contextId, profileId)
        : undefined;
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    let children;
    if (contextNode) {
        // children = await node.getChildrenInContext(contextNode, )
        children = await node.getChildrenInContext(contextNode, relations);
    }
    else {
        children = await node.getChildren(relations);
    }
    // console.log("test",children);
    const childrenInfo = [];
    for (const child of children) {
        const info = {
            dynamicId: child._server_id,
            staticId: child.getId().get(),
            name: child.getName().get(),
            type: child.getType().get(),
            icon: child.info.icon?.get(),
            bimFileId: child.info.bimFileId?.get(),
            dbid: child.info.dbid?.get(),
        };
        childrenInfo.push(info);
    }
    return childrenInfo;
}
exports.getChildrenNodesInfo = getChildrenNodesInfo;
exports.default = getChildrenNodesInfo;
//# sourceMappingURL=getChildrenNodesInfo.js.map