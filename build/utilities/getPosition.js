"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomPosition = exports.getEquipmentPosition = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
async function getEquipmentPosition(spinalAPIMiddleware, profileId, spatialContextId, dynamicId) {
    const equipment = await spinalAPIMiddleware.load(dynamicId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(equipment);
    if (equipment.getType().get() !== "BIMObject") {
        throw new Error("node is not of type BimObject");
    }
    let room;
    let floor;
    room = (await equipment.getParents("hasBimObject"))
        .find(parent => parent.getType().get() === "geographicRoom" && parent.getContextIds().includes(spatialContextId));
    if (!room) { // BIM Object might be a reference object of a room
        room = (await equipment.getParents("hasReferenceObject.ROOM"))
            .find(parent => parent.getType().get() === "geographicRoom" && parent.getContextIds().includes(spatialContextId));
    }
    if (!room) { // BIM Object might be a reference object of a floor
        floor = (await equipment.getParents("hasReferenceObject"))
            .find(parent => parent.getType().get() === "geographicFloor" && parent.getContextIds().includes(spatialContextId));
    }
    if (!floor) {
        floor = (await room.getParents("hasGeographicRoom"))
            .find(parent => parent.getType().get() === "geographicFloor" && parent.getContextIds().includes(spatialContextId));
    }
    const building = (await floor.getParents("hasGeographicFloor"))
        .find(parent => parent.getType().get() === "geographicBuilding" && parent.getContextIds().includes(spatialContextId));
    const context = (await building.getParents("hasGeographicBuilding"))
        .find(parent => parent.getType().get() === "geographicContext" && parent.getId().get() === spatialContextId);
    return {
        dynamicId: equipment._server_id,
        staticId: equipment.getId().get(),
        name: equipment.getName().get(),
        type: equipment.getType().get(),
        info: {
            context: {
                dynamicId: context._server_id,
                staticId: context.getId().get(),
                name: context.getName().get(),
                type: context.getType().get()
            },
            building: {
                dynamicId: building._server_id,
                staticId: building.getId().get(),
                name: building.getName().get(),
                type: building.getType().get()
            },
            floor: {
                dynamicId: floor._server_id,
                staticId: floor.getId().get(),
                name: floor.getName().get(),
                type: floor.getType().get()
            },
            room: room ? {
                dynamicId: room?._server_id,
                staticId: room?.getId().get(),
                name: room?.getName().get(),
                type: room?.getType().get()
            } : null
        }
    };
}
exports.getEquipmentPosition = getEquipmentPosition;
async function getRoomPosition(spinalAPIMiddleware, profileId, spatialContextId, dynamicId) {
    const room = await spinalAPIMiddleware.load(dynamicId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
    if (room.getType().get() !== "geographicRoom") {
        throw new Error("node is not of type geographicRoom");
    }
    const floor = (await room.getParents("hasGeographicRoom"))
        .find(parent => parent.getType().get() === "geographicFloor" && parent.getContextIds().includes(spatialContextId));
    const building = (await floor.getParents("hasGeographicFloor"))
        .find(parent => parent.getType().get() === "geographicBuilding" && parent.getContextIds().includes(spatialContextId));
    const context = (await building.getParents("hasGeographicBuilding"))
        .find(parent => parent.getType().get() === "geographicContext" && parent.getId().get() === spatialContextId);
    return {
        dynamicId: room._server_id,
        staticId: room.getId().get(),
        name: room.getName().get(),
        type: room.getType().get(),
        info: {
            context: {
                dynamicId: context._server_id,
                staticId: context.getId().get(),
                name: context.getName().get(),
                type: context.getType().get()
            },
            building: {
                dynamicId: building._server_id,
                staticId: building.getId().get(),
                name: building.getName().get(),
                type: building.getType().get()
            },
            floor: {
                dynamicId: floor._server_id,
                staticId: floor.getId().get(),
                name: floor.getName().get(),
                type: floor.getType().get()
            }
        }
    };
}
exports.getRoomPosition = getRoomPosition;
//# sourceMappingURL=getPosition.js.map