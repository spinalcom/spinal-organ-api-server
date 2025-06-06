"use strict";
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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/ticket/{ticketId}/move_to_step:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: move a Ticket to a specific step
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
     *             properties:
     *               workflowDynamicId:
     *                 type: number
     *               toStepOrder:
     *                 type: number
     *                 description: "Order number of the target step (optional, required if toStepName is not provided)"
     *               toStepName:
     *                 type: string
     *                 description: "Name of the target step (optional, required if toStepOrderId is not provided)"
     *     responses:
     *       200:
     *         description: move to next step Successfully
     *       400:
     *         description: move to next step not Successfully
     */
    app.post('/api/v1/ticket/:ticketId/move_to_step', async (req, res, next) => {
        try {
            const { toStepOrder, toStepName } = req.body;
            if (toStepOrder == null && toStepName == null) {
                return res.status(400).send('Either toStepOrder or toStepName must be provided.');
            }
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const workflow = await spinalAPIMiddleware.load(parseInt(req.body.workflowDynamicId, 10), profileId);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(workflow);
            const ticket = await spinalAPIMiddleware.load(parseInt(req.params.ticketId, 10), profileId);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(ticket);
            const fromStepId = ticket.info.stepId.get();
            const processNode = await spinal_service_ticket_1.serviceTicketPersonalized.getTicketProcess(ticket.getId().get());
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(processNode);
            const steps = await spinal_service_ticket_1.serviceTicketPersonalized.getStepsFromProcess(processNode.getId().get(), workflow.getId().get());
            const toStep = steps.find(step => step.name.get() === toStepName || step.order.get() === toStepOrder);
            if (!toStep) {
                return res.status(400).send('Target step not found.');
            }
            if (toStep.id.get() === fromStepId) {
                return res.status(400).send('The ticket is already in the target step.');
            }
            const result = await spinal_service_ticket_1.serviceTicketPersonalized.moveTicketToStep(ticket.getId().get(), fromStepId, toStep.id.get(), workflow.getId().get());
            const info = {
                name: ticket.getName().get(),
                id: ticket.getId().get(),
                description: ticket.info.description.get(),
                stepId: ticket.info.stepId.get(),
            };
            return res.json(info);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
    });
};
//# sourceMappingURL=ticketMoveToStep.js.map