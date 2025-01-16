"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChildrenNodesInfo = void 0;
async function getChildrenNodesInfo(spinalAPIMiddleware, profileId, dynamicId, relations, contextId) {
    // if we have a contextId we will get the children in the context.
    // Additionally , if we have relations we will restrict the children to the relations
    let contextNode = undefined;
    if (contextId) {
        contextNode = await spinalAPIMiddleware.load(contextId);
    }
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    let children = await node.getChildren(relations);
    if (contextNode) {
        children = children.filter((child) => {
            return child.belongsToContext(contextNode);
        });
    }
    const childrenInfo = [];
    for (const child of children) {
        const info = {
            dynamicId: child._server_id,
            staticId: child.getId().get(),
            name: child.getName().get(),
            type: child.getType().get(),
        };
        childrenInfo.push(info);
    }
    return childrenInfo;
}
exports.getChildrenNodesInfo = getChildrenNodesInfo;
exports.default = getChildrenNodesInfo;
//# sourceMappingURL=getChildrenNodesInfo.js.map