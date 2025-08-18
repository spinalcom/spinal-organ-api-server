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
const getWorkflowContextNode_1 = require("../../../utilities/workflow/getWorkflowContextNode");
const awaitSync_1 = require("../../../utilities/awaitSync");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/workflow/{id}/create_step:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: add a Step
     *     summary: add a Step
     *     tags:
     *       - Workflow & ticket
     *     parameters:
     *       - in: path
     *         name: id
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
     *               - processDynamicId
     *               - name
     *               - color
     *               - order
     *             properties:
     *               processDynamicId:
     *                 type: number
     *               name:
     *                 type: string
     *               color:
     *                 type: string
     *               order:
     *                 type: number
     *     responses:
     *       200:
     *         description: Added Successfully
     *       400:
     *         description: Add not Successfully
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
            const processNode = await spinalAPIMiddleware.load(parseInt(req.body.processDynamicId, 10), profileId);
            if (!(processNode instanceof spinal_model_graph_1.SpinalNode))
                return res.status(400).send('Invalid processDynamicId');
            // check stepsNodes duplication
            const stepsNodes = await (0, spinal_service_ticket_1.getStepNodesFromProcess)(processNode, workflowContextNode);
            if (stepsNodes.some((stepNode) => stepNode.info.name.get() === req.body.name)) {
                return res.status(400).send('The name of step already exists');
            }
            // create stepNode
            const stepNode = await (0, spinal_service_ticket_1.createStepToProcess)(processNode, workflowContextNode, req.body.name, req.body.color, req.body.order);
            // the creation was local so we need to sync it
            await (0, awaitSync_1.awaitSync)(stepNode);
            return res.status(200).json({
                dynamicId: stepNode._server_id,
                staticId: stepNode.info.id?.get() || undefined,
                name: stepNode.info.name?.get() || undefined,
                type: stepNode.info.type?.get() || undefined,
                color: stepNode.info.color?.get() || undefined,
                order: stepNode.info.order?.get() || undefined,
            });
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error.message);
        }
    });
};
//# sourceMappingURL=createStep.js.map