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
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_model_graph_1 = require("spinal-model-graph");
const spinal_service_ticket_1 = require("spinal-service-ticket");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const getWorkflowContextNode_1 = require("src/utilities/workflow/getWorkflowContextNode");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/workflow/{workflowId}/process/{processId}/stepList:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Returns list of steps
     *     summary: Get list of steps
     *     tags:
     *       - Workflow & ticket
     *     parameters:
     *      - in: path
     *        name: workflowId
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: path
     *        name: processId
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
     *                $ref: '#/components/schemas/Step'
     *       400:
     *         description: Bad request
     */
    app.get('/api/v1/workflow/:workflowId/process/:processId/stepList', async (req, res) => {
        // check if workflowId and processId   are valid
        if (!req.params.workflowId || isNaN(+req.params.workflowId))
            return res.status(400).send('Invalid workflowId');
        if (!req.params.processId || isNaN(+req.params.processId))
            return res.status(400).send('Invalid processId');
        const nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const [workflowContextNode, processNode] = await Promise.all([
                (0, getWorkflowContextNode_1.getWorkflowContextNode)(spinalAPIMiddleware, profileId, req.params.workflowId),
                spinalAPIMiddleware.load(parseInt(req.params.processId, 10), profileId),
            ]);
            if (!(processNode instanceof spinal_model_graph_1.SpinalNode) ||
                processNode.info.type.get() !== spinal_service_ticket_1.PROCESS_TYPE ||
                !processNode.belongsToContext(workflowContextNode)) {
                return res.status(400).send('Invalid process');
            }
            const stepNodes = await (0, spinal_service_ticket_1.getStepNodesFromProcess)(processNode, workflowContextNode);
            return res.status(200).json(stepNodes.map((realNode) => {
                return {
                    dynamicId: realNode._server_id,
                    staticId: realNode.getId().get(),
                    name: realNode.getName().get(),
                    type: realNode.getType().get(),
                    color: realNode.info.color.get(),
                    order: realNode.info.order.get(),
                    processId: realNode.info.processId.get(),
                };
            }));
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error.message);
        }
    });
};
//# sourceMappingURL=stepsListFromProcess.js.map