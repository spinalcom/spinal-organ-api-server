"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recTreeDepth = exports.recTree = void 0;
async function recTree(node, context = node) {
    const childrenIds = await node.getChildrenInContext(context);
    if (childrenIds.length > 0) {
        const promises = childrenIds.map(async (realnode) => {
            const name = realnode.getName();
            const type = realnode.getType();
            return {
                dynamicId: realnode._server_id,
                staticId: realnode.getId().get(),
                name: name ? name.get() : undefined,
                type: type ? type.get() : undefined,
                color: realnode.info.color?.get(),
                bimFileId: realnode.info.bimFileId ? realnode.info.bimFileId.get() : undefined,
                dbid: realnode.info.dbid ? realnode.info.dbid.get() : undefined,
                children: await recTree(realnode, context)
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
            const name = realnode.getName();
            const type = realnode.getType();
            if (type.get() === "geographicFloor") {
                realnode;
            }
            return {
                dynamicId: realnode._server_id,
                staticId: realnode.getId().get(),
                name: name ? name.get() : undefined,
                type: type ? type.get() : undefined,
                children: await recTree(realnode, context)
            };
        });
        return Promise.all(promises);
    }
    else {
        return [];
    }
}
async function recTreeDepth(node, context = node, depth) {
    const childrenIds = await node.getChildrenInContext(context);
    if (childrenIds.length > 0 && depth > 0) {
        const promises = childrenIds.map(async (realnode) => {
            const name = realnode.getName();
            const type = realnode.getType();
            const info = {
                dynamicId: realnode._server_id,
                staticId: realnode.getId().get(),
                name: name ? name.get() : undefined,
                type: type ? type.get() : undefined,
                children: await recTreeDepth(realnode, context, depth - 1)
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