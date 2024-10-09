"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomReferenceObjectsListInfo = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
async function getRoomReferenceObjectsListInfo(spinalAPIMiddleware, profileId, dynamicId) {
    const room = await spinalAPIMiddleware.load(dynamicId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
    if (room.getType().get() !== "geographicRoom") {
        throw new Error("node is not of type geographic room");
    }
    const referenceObjects = await room.getChildren("hasReferenceObject.ROOM");
    const _objects = [];
    let bimFileId;
    for (const referenceObject of referenceObjects) {
        bimFileId = referenceObject.info.bimFileId.get();
        const infoReferencesObject = {
            dynamicId: referenceObject._server_id,
            staticId: referenceObject.getId().get(),
            name: referenceObject.getName().get(),
            type: referenceObject.getType().get(),
            version: referenceObject.info.version?.get(),
            externalId: referenceObject.info.externalId.get(),
            dbid: referenceObject.info.dbid.get(),
            bimFileId: referenceObject.info.bimFileId.get(),
        };
        _objects.push(infoReferencesObject);
    }
    return {
        dynamicId: room._server_id,
        staticId: room.getId().get(),
        name: room.getName().get(),
        type: room.getType().get(),
        bimFileId,
        infoReferencesObjects: _objects
    };
}
exports.getRoomReferenceObjectsListInfo = getRoomReferenceObjectsListInfo;
exports.default = getRoomReferenceObjectsListInfo;
//# sourceMappingURL=getRoomReferenceObjectListInfo.js.map