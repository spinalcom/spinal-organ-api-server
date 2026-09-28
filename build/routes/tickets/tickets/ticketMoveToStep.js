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
     *         - write
     *     summary: Move a ticket to a chosen step
     *     description: >-
     *       Moves a ticket straight to a given step of its process, in either direction - unlike
     *       `next_step` / `previous_step`, which advance one step at a time.
     *
     *
     *       The target step is named either by its order number (`toStepOrder`) or by its name
     *       (`toStepName`); at least one of the two is required. Note that the process is not passed
     *       here : the step is looked up in the process the ticket currently belongs to.
     *     tags:
     *       - Workflow & ticket
     *     parameters:
     *       - in: path
     *         name: ticketId
     *         description: Dynamic ID of the ticket.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - workflowDynamicId
     *             properties:
     *               workflowDynamicId:
     *                 type: number
     *                 description: Dynamic ID of the workflow context the ticket lives in.
     *               toStepOrder:
     *                 type: number
     *                 description: Order number of the target step. Required when `toStepName` is not given.
     *               toStepName:
     *                 type: string
     *                 description: Name of the target step. Required when `toStepOrder` is not given.
     *     responses:
     *       200:
     *         description: The ticket with the step it now sits in.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 dynamicId:
     *                   type: integer
     *                   format: int64
     *                 staticId:
     *                   type: string
     *                 name:
     *                   type: string
     *                 type:
     *                   type: string
     *                 actuelStep:
     *                   type: string
     *                   description: Name of the step the ticket is in after the move.
     *       400:
     *         description: >-
     *           Neither `toStepOrder` nor `toStepName` was given ("Either toStepOrder or toStepName must
     *           be provided."), no step matches ("Target step not found."), or the ticket does not belong
     *           to the workflow.
     *       401:
     *         description: The profile is not allowed to write on the ticket.
     *       500:
     *         description: The workflow or the ticket could not be loaded, or is not of the expected type.
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