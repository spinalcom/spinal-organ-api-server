"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_service_ticket_1 = require("spinal-service-ticket");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/ticket/{ticketId}/previous_step:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Move a ticket back to the previous step of its process
     *     description: >-
     *       Moves a ticket back by one step, following the order of the steps of its process. A ticket
     *       already in the first step stays where it is.
     *
     *
     *       The workflow and the process must be given in the body, and both the process and the ticket
     *       must belong to that workflow.
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
     *               - processDynamicId
     *             properties:
     *               workflowDynamicId:
     *                 type: number
     *                 description: Dynamic ID of the workflow context the ticket lives in.
     *               processDynamicId:
     *                 type: number
     *                 description: Dynamic ID of the process, which must belong to that workflow.
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
     *           The process does not belong to the workflow ("Process does not belong to workflow
     *           context."), or the ticket does not ("Ticket does not belong to workflow context.").
     *       401:
     *         description: The profile is not allowed to write on the ticket.
     *       500:
     *         description: One of the three nodes could not be loaded, or is not of the expected type.
     */
    app.post('/api/v1/ticket/:ticketId/previous_step', async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const [workflowContextNode, processNode, ticketNode] = await Promise.all([
                (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parseInt(req.body.workflowDynamicId, 10), profileId, spinal_service_ticket_1.TICKET_CONTEXT_TYPE),
                (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parseInt(req.body.processDynamicId, 10), profileId, spinal_service_ticket_1.PROCESS_TYPE),
                (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parseInt(req.params.ticketId, 10), profileId, spinal_service_ticket_1.SPINAL_TICKET_SERVICE_TICKET_TYPE),
            ]);
            if (processNode.belongsToContext(workflowContextNode) === false)
                return res
                    .status(400)
                    .send('Process does not belong to workflow context.');
            if (ticketNode.belongsToContext(workflowContextNode) === false)
                return res
                    .status(400)
                    .send('Ticket does not belong to workflow context.');
            await (0, spinal_service_ticket_1.moveTicketToPreviousStep)(workflowContextNode, processNode, ticketNode);
            const step = await (0, spinal_service_ticket_1.getStepFromTicket)(ticketNode, workflowContextNode);
            const info = {
                dynamicId: ticketNode._server_id,
                staticId: ticketNode.info.id.get(),
                name: ticketNode.info.name.get(),
                type: ticketNode.info.type.get(),
                actuelStep: step?.info.name?.get(),
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
//# sourceMappingURL=ticketPreviousStep.js.map