"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNodePositionInContext = void 0;
async function getNodePositionInContext(context, node) {
    const contextStaticId = context.getId().get();
    return await buildPaths(node, contextStaticId);
}
exports.getNodePositionInContext = getNodePositionInContext;
async function buildPaths(node, contextStaticId) {
    const nodeName = node.getName().get();
    const nodeId = node._server_id;
    if (node.getId().get() === contextStaticId) {
        return { name: nodeName, dynamicId: nodeId, type: node.getType().get(), parentsInContext: [] };
    }
    const parents = await node.getParents();
    const parentsInContext = [];
    for (const parent of parents) {
        const contextIds = parent.getContextIds();
        if (contextIds.includes(contextStaticId) || parent.getId().get() === contextStaticId) {
            const parentPath = await buildPaths(parent, contextStaticId);
            parentsInContext.push(parentPath);
        }
    }
    return {
        name: nodeName,
        dynamicId: nodeId,
        type: node.getType().get(),
        parentsInContext,
    };
}
//# sourceMappingURL=getNodePositionInContext.js.map