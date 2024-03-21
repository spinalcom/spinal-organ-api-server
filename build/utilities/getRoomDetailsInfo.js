"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomDetailsInfo = void 0;
const constants_1 = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
async function getRoomDetailsInfo(spinalAPIMiddleware, profileId, dynamicId) {
    let area = 0;
    const _bimObjects = [];
    const room = await spinalAPIMiddleware.load(dynamicId, profileId);
    const t = [];
    let bimFileId;
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
    if (room.getType().get() !== "geographicRoom") {
        throw new Error("node is not of type geographic room");
    }
    const bimObjects = await room.getChildren("hasBimObject");
    for (const bimObject of bimObjects) {
        bimFileId = bimObject.info.bimFileId.get();
        const infoBimObject = {
            staticId: bimObject.getId().get(),
            name: bimObject.getName().get(),
            type: bimObject.getType().get(),
            version: bimObject.info.version.get(),
            externalId: bimObject.info.externalId.get(),
            dbid: bimObject.info.dbid.get(),
        };
        _bimObjects.push(infoBimObject);
    }
    const categories = await room.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
    for (const child of categories) {
        if (child.getName().get() === "Spatial") {
            const attributs = await child.element.load();
            for (const attribut of attributs.get()) {
                if (attribut.label === "area") {
                    area = attribut.value;
                }
            }
        }
    }
    return {
        area: area,
        bimFileId: bimFileId,
        _bimObjects: _bimObjects
    };
}
exports.getRoomDetailsInfo = getRoomDetailsInfo;
exports.default = getRoomDetailsInfo;
//# sourceMappingURL=getRoomDetailsInfo.js.map