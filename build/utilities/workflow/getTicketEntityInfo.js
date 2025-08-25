"use strict";
/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
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
exports.getTicketEntityInfo = void 0;
const loadAndValidateNode_1 = require("../loadAndValidateNode");
const spinal_service_ticket_1 = require("spinal-service-ticket");
async function getTicketEntityInfo(spinalAPIMiddleware, profileId, ticketId) {
    const ticketNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, ticketId, profileId);
    const targetNode = await (0, spinal_service_ticket_1.getNodeFromTicket)(ticketNode);
    if (!targetNode)
        return undefined;
    const info = {
        dynamicId: targetNode._server_id,
        staticId: targetNode.info.id.get(),
        name: targetNode.info.name.get(),
        type: targetNode.info.type.get(),
    };
    return info;
}
exports.getTicketEntityInfo = getTicketEntityInfo;
exports.default = getTicketEntityInfo;
//# sourceMappingURL=getTicketEntityInfo.js.map