"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_service_ticket_1 = require("spinal-service-ticket");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
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
    app.post('/api/v1/ticket/:ticketId/move_to_step', async (req, res) => {
        try {
            const { toStepOrder, toStepName } = req.body;
            if (toStepOrder == null && toStepName == null) {
                return res
                    .status(400)
                    .send('Either toStepOrder or toStepName must be provided.');
            }
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const [workflowContextNode, ticketNode] = await Promise.all([
                (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parseInt(req.body.workflowDynamicId, 10), profileId, spinal_service_ticket_1.TICKET_CONTEXT_TYPE),
                (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parseInt(req.params.ticketId, 10), profileId, spinal_service_ticket_1.SPINAL_TICKET_SERVICE_TICKET_TYPE),
            ]);
            if (!ticketNode.belongsToContext(workflowContextNode)) {
                return res
                    .status(400)
                    .send('Ticket does not belong to the workflow context.');
            }
            const fromStepNode = await (0, spinal_service_ticket_1.getStepFromTicket)(ticketNode);
            const processNode = await (0, spinal_service_ticket_1.getProcessFromStep)(fromStepNode);
            const steps = await (0, spinal_service_ticket_1.getStepNodesFromProcess)(processNode, workflowContextNode);
            const toStepNode = steps.find((step) => step.info.name.get() === toStepName ||
                step.info.order.get() === toStepOrder);
            if (!toStepNode) {
                return res.status(400).send('Target step not found.');
            }
            if (toStepNode._server_id === fromStepNode._server_id) {
                return res
                    .status(400)
                    .send('The ticket is already in the target step.');
            }
            await (0, spinal_service_ticket_1.moveTicketToStep)(ticketNode, fromStepNode, toStepNode, workflowContextNode);
            const { description } = await (0, spinal_service_ticket_1.getTicketInfo)(ticketNode, [
                'description',
            ]);
            const info = {
                name: ticketNode.info.name.get(),
                id: ticketNode.info.id.get(),
                description,
                stepId: toStepNode.info.id.get(),
            };
            return res.json(info);
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error?.message);
        }
    });
};
//# sourceMappingURL=ticketMoveToStep.js.map