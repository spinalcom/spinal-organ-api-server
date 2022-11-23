"use strict";
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_service_ticket_1 = require("spinal-service-ticket");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{id}/ticket_list:
     *   get:
     *     security:
     *       - OauthSecurity:
     *         - readOnly
     *     description: Returns list of tickets object
     *     summary: Get list of tickets object
     *     tags:
     *       - Nodes
     *     parameters:
     *      - in: path
     *        name: id
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Ticket'
     *       400:
     *         description: Bad request
     */
    app.get('/api/v1/node/:id/ticket_list', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        let nodes = [];
        try {
            yield spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var node = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            var ticketList = yield node.getChildren(spinal_service_ticket_1.TICKET_RELATION_NAME);
            for (const ticket of ticketList) {
                //context && workflow
                const workflow = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(ticket.getContextIds()[0]);
                //Step
                let _step = yield ticket
                    .getParents(spinal_service_ticket_1.TICKET_RELATION_NAME)
                    .then((steps) => {
                    for (const step of steps) {
                        if (step.getType().get() === spinal_service_ticket_1.STEP_TYPE) {
                            return step;
                        }
                    }
                });
                let _process = yield _step
                    .getParents(spinal_service_ticket_1.STEP_RELATION_NAME)
                    .then((processes) => {
                    for (const process of processes) {
                        if (process.getType().get() === spinal_service_ticket_1.PROCESS_TYPE) {
                            return process;
                        }
                    }
                });
                var info = {
                    dynamicId: ticket._server_id,
                    staticId: ticket.getId().get(),
                    name: ticket.getName().get(),
                    type: ticket.getType().get(),
                    priority: ticket.info.priority.get(),
                    creationDate: ticket.info.creationDate.get(),
                    userName: ticket.info.user ? ((_a = ticket.info.user.username) === null || _a === void 0 ? void 0 : _a.get()) || ((_b = ticket.info.user.name) === null || _b === void 0 ? void 0 : _b.get()) || "" : "",
                    gmaoId: ticket.info.gmaoId == undefined ? '' : ticket.info.gmaoId.get(),
                    gmaoDateCreation: ticket.info.gmaoDateCreation == undefined
                        ? ''
                        : ticket.info.gmaoDateCreation.get(),
                    description: ticket.info.description == undefined
                        ? ''
                        : ticket.info.description.get(),
                    declarer_id: ticket.info.declarer_id == undefined
                        ? ''
                        : ticket.info.declarer_id.get(),
                    process: _process === undefined
                        ? ''
                        : {
                            dynamicId: _process._server_id,
                            staticId: _process.getId().get(),
                            name: _process.getName().get(),
                            type: _process.getType().get(),
                        },
                    step: _step === undefined
                        ? ''
                        : {
                            dynamicId: _step._server_id,
                            staticId: _step.getId().get(),
                            name: _step.getName().get(),
                            type: _step.getType().get(),
                            color: _step.info.color.get(),
                            order: _step.info.order.get(),
                        },
                    workflowId: workflow === null || workflow === void 0 ? void 0 : workflow._server_id,
                    workflowName: workflow === null || workflow === void 0 ? void 0 : workflow.getName().get(),
                };
                nodes.push(info);
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send('ko');
        }
        res.json(nodes);
    }));
};
//# sourceMappingURL=nodeTicketList.js.map