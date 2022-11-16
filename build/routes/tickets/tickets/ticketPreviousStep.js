"use strict";
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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_service_ticket_1 = require("spinal-service-ticket");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
    * @swagger
    * /api/v1/ticket/{ticketId}/previous_step:
    *   post:
    *     security:
    *       - OauthSecurity:
    *         - read
    *     description: move a Ticket
    *     summary: move a Ticket
    *     tags:
    *       - Workflow & ticket
    *     parameters:
    *       - in: path
    *         name: ticketId
    *         description: use the dynamic ID
    *         required: true
    *         schema:
    *           type: integer
    *           format: int64
    *     requestBody:
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             required:
    *               - workflowDynamicId
    *               - processDynamicId
    *             properties:
    *               workflowDynamicId:
    *                 type: number
    *               processDynamicId:
    *                 type: number
    *     responses:
    *       200:
    *         description: move to previous step Successfully
    *       400:
    *         description: move to previous step not Successfully
    */
    app.post("/api/v1/ticket/:ticketId/previous_step", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            var workflow = yield spinalAPIMiddleware.load(parseInt(req.body.workflowDynamicId, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(workflow);
            var process = yield spinalAPIMiddleware.load(parseInt(req.body.processDynamicId, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(process);
            var ticket = yield spinalAPIMiddleware.load(parseInt(req.params.ticketId, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(ticket);
            yield spinal_service_ticket_1.serviceTicketPersonalized.moveTicketToPreviousStep(workflow.getId().get(), process.getId().get(), ticket.getId().get());
            var step = yield ticket.getParents("SpinalSystemServiceTicketHasTicket").then((steps) => {
                for (const step of steps) {
                    if (step.getType().get() === "SpinalSystemServiceTicketTypeStep") {
                        return step;
                    }
                }
            });
            var info = {
                dynamicId: ticket._server_id,
                staticId: ticket.getId().get(),
                name: ticket.getName().get(),
                type: ticket.getType().get(),
                actuelStep: step.getName().get()
            };
        }
        catch (error) {
            console.log(error);
            res.status(400).send("ko");
        }
        res.json(info);
    }));
};
//# sourceMappingURL=ticketPreviousStep.js.map