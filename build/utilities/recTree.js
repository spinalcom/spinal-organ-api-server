"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recTreeDepth = exports.recTreeDetails = exports.recTree = void 0;
async function recTree(node, context = node) {
    const childrenIds = await node.getChildrenInContext(context);
    if (childrenIds.length > 0) {
        const promises = childrenIds.map(async (realnode) => {
            return {
                dynamicId: realnode._server_id,
                staticId: realnode.info.id?.get() || undefined,
                name: realnode.info.name?.get() || undefined,
                type: realnode.info.type?.get() || undefined,
                color: realnode.info.color?.get() || undefined,
                bimFileId: realnode.info.bimFileId?.get() || undefined,
                dbid: realnode.info.dbid?.get() || undefined,
                children: await recTree(realnode, context),
            };
        });
        return Promise.all(promises);
    }
    else {
        return [];
    }
}
exports.recTree = recTree;
async function recTreeDetails(node, context = node) {
    const childrenIds = await node.getChildrenInContext(context);
    if (childrenIds.length > 0) {
        const promises = childrenIds.map(async (realnode) => {
            return {
                dynamicId: realnode._server_id,
                staticId: realnode.info.id?.get() || undefined,
                name: realnode.info.name?.get() || undefined,
                type: realnode.info.type?.get() || undefined,
                children: await recTree(realnode, context),
            };
        });
        return Promise.all(promises);
    }
    else {
        return [];
    }
}
exports.recTreeDetails = recTreeDetails;
async function recTreeDepth(node, context = node, depth) {
    const childrenIds = await node.getChildrenInContext(context);
    if (childrenIds.length > 0 && depth > 0) {
        const promises = childrenIds.map(async (realnode) => {
            const info = {
                dynamicId: realnode._server_id,
                staticId: realnode.info.id?.get() || undefined,
                name: realnode.info.name?.get() || undefined,
                type: realnode.info.type?.get() || undefined,
                children: await recTreeDepth(realnode, context, depth - 1),
            };
            return info;
        });
        return Promise.all(promises);
    }
    else {
        return [];
    }
}
exports.recTreeDepth = recTreeDepth;
//# sourceMappingURL=recTree.js.map