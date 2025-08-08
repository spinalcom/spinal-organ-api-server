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
exports.getWorkflowContextNode = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const spinal_service_ticket_1 = require("spinal-service-ticket");
async function getWorkflowContextNode(spinalAPIMiddleware, profileId, workflowServerId) {
    const workflowContextNode = await spinalAPIMiddleware.load(parseInt(workflowServerId, 10), profileId);
    if (!(workflowContextNode instanceof spinal_model_graph_1.SpinalContext) ||
        workflowContextNode.info.type?.get() !== spinal_service_ticket_1.TICKET_CONTEXT_TYPE)
        throw {
            code: 400,
            message: `this context is not a '${spinal_service_ticket_1.TICKET_CONTEXT_TYPE}'`,
        };
    return workflowContextNode;
}
exports.getWorkflowContextNode = getWorkflowContextNode;
//# sourceMappingURL=getWorkflowContextNode.js.map