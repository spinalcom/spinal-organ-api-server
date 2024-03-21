"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventListInfo = void 0;
const spinal_env_viewer_task_service_1 = require("spinal-env-viewer-task-service");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
async function getEventListInfo(spinalAPIMiddleware, profileId, dynamicId) {
    await spinalAPIMiddleware.getGraph();
    const nodes = [];
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
    const listEvents = await spinal_env_viewer_task_service_1.SpinalEventService.getEvents(node.getId().get());
    for (const child of listEvents) {
        // @ts-ignore
        const _child = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(child.id.get());
        if (_child.getType().get() === 'SpinalEvent') {
            const info = {
                dynamicId: _child._server_id,
                staticId: _child.getId().get(),
                name: _child.getName().get(),
                type: _child.getType().get(),
                groupID: _child.info.groupId.get(),
                categoryID: child.categoryId.get(),
                nodeId: _child.info.nodeId.get(),
                repeat: _child.info.repeat.get(),
                description: _child.info.description.get(),
                startDate: _child.info.startDate.get(),
                endDate: _child.info.endDate.get(),
            };
            nodes.push(info);
        }
    }
    return nodes;
}
exports.getEventListInfo = getEventListInfo;
exports.default = getEventListInfo;
//# sourceMappingURL=getEventListInfo.js.map