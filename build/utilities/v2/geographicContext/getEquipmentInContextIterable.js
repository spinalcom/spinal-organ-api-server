"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEquipmentInContextIterable = getEquipmentInContextIterable;
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
async function* getEquipmentInContextIterable(geographicContext, buildingNode, bimObjectType) {
    const floors = await buildingNode.getChildrenInContext(geographicContext, spinal_env_viewer_context_geographic_service_1.FLOOR_RELATION);
    for (const floorNode of floors) {
        if (bimObjectType === 'referenceFloor') {
            const referenceFloors = await floorNode.getChildren(spinal_env_viewer_context_geographic_service_1.REFERENCE_RELATION);
            for (const referenceFloorNode of referenceFloors) {
                yield { node: referenceFloorNode, parentId: floorNode._server_id };
            }
        }
        else {
            const rooms = await floorNode.getChildrenInContext(geographicContext, spinal_env_viewer_context_geographic_service_1.ROOM_RELATION);
            if (bimObjectType === 'referenceRoom') {
                const referenceRooms = await Promise.all(rooms.map((roomNode) => {
                    return roomNode.getChildren(spinal_env_viewer_context_geographic_service_1.REFERENCE_ROOM_RELATION).then(nodes => {
                        return { nodes, roomNode };
                    });
                }));
                for (const { nodes, roomNode } of referenceRooms) {
                    for (const referenceRoomNode of nodes) {
                        yield { node: referenceRoomNode, parentId: roomNode._server_id };
                    }
                }
            }
            else {
                for (const roomNode of rooms) {
                    const equipments = await roomNode.getChildrenInContext(geographicContext, spinal_env_viewer_context_geographic_service_1.EQUIPMENT_RELATION);
                    for (const equipmentNode of equipments) {
                        yield { node: equipmentNode, parentId: roomNode._server_id };
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=getEquipmentInContextIterable.js.map