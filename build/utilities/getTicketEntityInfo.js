"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketEntityInfo = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
async function getTicketEntityInfo(spinalAPIMiddleware, profileId, ticketId) {
    const _ticket = await spinalAPIMiddleware.load(ticketId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(_ticket);
    const elementSelected = await spinalAPIMiddleware.loadPtr(_ticket.info.elementSelected);
    const info = {
        dynamicId: elementSelected._server_id,
        staticId: elementSelected.getId().get(),
        name: elementSelected.getName().get(),
        type: elementSelected.getType().get(),
    };
    return info;
}
exports.getTicketEntityInfo = getTicketEntityInfo;
exports.default = getTicketEntityInfo;
//# sourceMappingURL=getTicketEntityInfo.js.map