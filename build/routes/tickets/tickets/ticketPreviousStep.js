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