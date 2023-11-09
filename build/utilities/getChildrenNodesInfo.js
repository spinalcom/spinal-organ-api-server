"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChildrenNodesInfo = void 0;
async function getChildrenNodesInfo(spinalAPIMiddleware, profileId, dynamicId, relations) {
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    const children = await node.getChildren(relations);
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