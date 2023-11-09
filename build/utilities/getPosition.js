"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomPosition = exports.getEquipmentPosition = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
async function getEquipmentPosition(spinalAPIMiddleware, profileId, dynamicId) {
    const equipment = await spinalAPIMiddleware.load(dynamicId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(equipment);
    if (equipment.getType().get() !== "BIMObject") {
        throw new Error("node is not of type BimObject");
    }
    const context = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(equipment.getContextIds()[0]);
    const room = (await equipment.getParents("hasBimObject"))
        .find(parent => parent.getType().get() === "geographicRoom");
    const floor = (await room.getParents("hasGeographicRoom"))
        .find(parent => parent.getType().get() === "geographicFloor");
    const building = (await floor.getParents("hasGeographicFloor"))
        .find(parent => parent.getType().get() === "geographicBuilding");
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
            room: {
                dynamicId: room._server_id,
                staticId: room.getId().get(),
                name: room.getName().get(),
                type: room.getType().get()
            }
        }
    };
}
exports.getEquipmentPosition = getEquipmentPosition;
async function getRoomPosition(spinalAPIMiddleware, profileId, dynamicId) {
    const room = await spinalAPIMiddleware.load(dynamicId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
    if (room.getType().get() !== "geographicRoom") {
        throw new Error("node is not of type geographicRoom");
    }
    const context = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(room.getContextIds()[0]);
    const floor = (await room.getParents("hasGeographicRoom"))
        .find(parent => parent.getType().get() === "geographicFloor");
    const building = (await floor.getParents("hasGeographicFloor"))
        .find(parent => parent.getType().get() === "geographicBuilding");
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