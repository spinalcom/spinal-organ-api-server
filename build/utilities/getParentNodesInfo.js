"use strict";
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