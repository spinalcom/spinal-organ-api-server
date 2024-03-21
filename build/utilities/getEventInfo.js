"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventInfo = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
async function getEventInfo(spinalAPIMiddleware, profileId, dynamicId) {
    const event = await spinalAPIMiddleware.load(dynamicId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(event);
    if (!(event.getType().get() === 'SpinalEvent')) {
        throw new Error('node is not of type SpinalEvent');
    }
    const info = {
        dynamicId: event._server_id,
        staticId: event.getId().get(),
        name: event.getName().get(),
        type: event.getType().get(),
        groupId: event.info.groupId.get(),
        categoryId: event.info.categoryId.get(),
        nodeId: event.info.nodeId.get(),
        repeat: event.info.repeat.get(),
        description: event.info.description.get(),
        startDate: event.info.startDate.get(),
        endDate: event.info.endDate.get(),
    };
    return info;
}
exports.getEventInfo = getEventInfo;
exports.default = getEventInfo;
//# sourceMappingURL=getEventInfo.js.map