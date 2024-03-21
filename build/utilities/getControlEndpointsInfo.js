"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getControlEndpointsInfo = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_control_endpoint_service_1 = require("spinal-env-viewer-plugin-control-endpoint-service");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
async function getControlEndpointsInfo(spinalAPIMiddleware, profilId, dynamicId) {
    const room = await spinalAPIMiddleware.load(dynamicId, profilId);
    // @ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
    const profils = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(room.getId().get(), [spinal_env_viewer_plugin_control_endpoint_service_1.spinalControlPointService.ROOM_TO_CONTROL_GROUP]);
    const promises = profils.map(async (profile) => {
        const result = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(profile.id.get(), [spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]);
        const endpoints = await result.map(async (endpoint) => {
            const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(endpoint.id.get());
            const element = await endpoint.element.load();
            const currentValue = element.currentValue.get();
            return {
                dynamicId: realNode._server_id,
                staticId: endpoint.id.get(),
                name: element.name.get(),
                type: element.type.get(),
                currentValue: currentValue
            };
        });
        return { dynamicId: dynamicId, profileName: profile.name.get(), endpoints: await Promise.all(endpoints) };
    });
    return await Promise.all(promises);
}
exports.getControlEndpointsInfo = getControlEndpointsInfo;
exports.default = getControlEndpointsInfo;
//# sourceMappingURL=getControlEndpointsInfo.js.map