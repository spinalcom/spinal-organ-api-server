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
const spinal_service_ticket_1 = require("spinal-service-ticket");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const getWorkflowContextNode_1 = require("../../../utilities/workflow/getWorkflowContextNode");
const awaitSync_1 = require("../../../utilities/awaitSync");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/workflow/{id}/create_step:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Create a step in a process
     *     description: >-
     *       Adds a step to a process of a workflow. The process is named in the body, the workflow in the
     *       path, and the process must belong to that workflow.
     *
     *
     *       `order` places the step in the pipeline, and `name` must not already be used by another step
     *       of the same process. `name` and `color` are both required and must be non-empty strings.
     *     tags:
     *       - Workflow & ticket
     *     parameters:
     *       - in: path
     *         name: id
     *         description: Dynamic ID of the workflow context.
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
     *               - processDynamicId
     *               - name
     *               - color
     *               - order
     *             properties:
     *               processDynamicId:
     *                 type: number
     *                 description: Dynamic ID of the process the step is added to.
     *               name:
     *                 type: string
     *               color:
     *                 type: string
     *                 description: Display colour of the step.
     *               order:
     *                 type: number
     *                 description: Position of the step in the pipeline.
     *     responses:
     *       201:
     *         description: The created step.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/Step'
     *       400:
     *         description: >-
     *           `processDynamicId` is not a number, `name` or `color` is missing or not a string, or the
     *           process already holds a step with that name ("The name of step already exists").
     *       401:
     *         description: The profile is not allowed to write on this workflow.
     *       500:
     *         description: The workflow or the process could not be loaded, or is not of the expected type.
     */
    app.post('/api/v1/workflow/:id/create_step', async (req, res) => {
        try {
            // check params
            if (!req.body.processDynamicId || isNaN(+req.body.processDynamicId))
                return res
                    .status(400)
                    .send('Invalid processDynamicId attribute in the body');
            if (!req.body.name || typeof req.body.name !== 'string')
                return res.status(400).send('Invalid name attribute in the body');
            if (!req.body.color || typeof req.body.color !== 'string')
                return res.status(400).send('Invalid color attribute in the body');
            await spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            // check workflowContextNode
            const workflowContextNode = await (0, getWorkflowContextNode_1.getWorkflowContextNode)(spinalAPIMiddleware, profileId, req.params.id);
            // check processNode
            const processNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parseInt(req.body.processDynamicId, 10), profileId, spinal_service_ticket_1.PROCESS_TYPE);
            // check stepsNodes duplication
            const stepsNodes = await (0, spinal_service_ticket_1.getStepNodesFromProcess)(processNode, workflowContextNode);
            if (stepsNodes.some((stepNode) => stepNode.info.name.get() === req.body.name)) {
                return res.status(400).send('The name of step already exists');
            }
            // create stepNode
            const stepNode = await (0, spinal_service_ticket_1.createStepToProcess)(processNode, workflowContextNode, req.body.name, req.body.color, req.body.order);
            // the creation was local so we need to sync it
            await (0, awaitSync_1.awaitSync)(stepNode);
            return res.status(201).json({
                dynamicId: stepNode._server_id,
                staticId: stepNode.info.id?.get() || undefined,
                name: stepNode.info.name?.get() || undefined,
                type: stepNode.info.type?.get() || undefined,
                color: stepNode.info.color?.get() || undefined,
                order: stepNode.info.order?.get() || undefined,
            });
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error?.message);
        }
    });
};
//# sourceMappingURL=createStep.js.map