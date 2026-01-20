"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketListInfo = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const getTicketDetails_1 = require("../utilities/workflow/getTicketDetails");
async function getTicketListInfo(spinalAPIMiddleware, profileId, dynamicId, includeAttachedItems = false) {
    const nodes = [];
    await spinalAPIMiddleware.getGraph();
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
    const ticketList = await node.getChildren('SpinalSystemServiceTicketHasTicket');
    for (const ticket of ticketList) {
        //@ts-ignore
        spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(ticket);
        const info = await (0, getTicketDetails_1.getTicketDetails)(spinalAPIMiddleware, profileId, ticket._server_id, includeAttachedItems);
        nodes.push(info);
    }
    return nodes;
}
exports.getTicketListInfo = getTicketListInfo;
exports.default = getTicketListInfo;
//# sourceMappingURL=getTicketListInfo.js.map