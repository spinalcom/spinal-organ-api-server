"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEquipmentListInfo = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
async function getEquipmentListInfo(spinalAPIMiddleware, profileId, roomId) {
    const nodes = [];
    const room = await spinalAPIMiddleware.load(roomId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
    if (room.getType().get() !== "geographicRoom") {
        throw new Error("node is not of type geographic room");
    }
    const childrens = await room.getChildren("hasBimObject");
    for (const child of childrens) {
        const info = {
            dynamicId: child._server_id,
            staticId: child.getId().get(),
            name: child.getName().get(),
            type: child.getType().get(),
            bimFileId: child.info.bimFileId.get(),
            version: child.info.version?.get(),
            externalId: child.info.externalId.get(),
            dbid: child.info.dbid.get(),
        };
        nodes.push(info);
    }
    return nodes;
}
exports.getEquipmentListInfo = getEquipmentListInfo;
exports.default = getEquipmentListInfo;
//# sourceMappingURL=getEquipmentListInfo.js.map