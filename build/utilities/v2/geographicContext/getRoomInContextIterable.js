"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomInContextIterable = getRoomInContextIterable;
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
async function* getRoomInContextIterable(geographicContext, buildingNode) {
    // for each building, load the floors
    const floors = await buildingNode.getChildrenInContext(geographicContext, spinal_env_viewer_context_geographic_service_1.FLOOR_RELATION);
    for (const floorNode of floors) {
        const rooms = await floorNode.getChildrenInContext(geographicContext, spinal_env_viewer_context_geographic_service_1.ROOM_RELATION);
        for (const roomNode of rooms) {
            yield { node: roomNode, parentId: floorNode._server_id };
        }
    }
}
//# sourceMappingURL=getRoomInContextIterable.js.map