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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_service_ticket_1 = require("spinal-service-ticket");
const getWorkflowContextNode_1 = require("src/utilities/workflow/getWorkflowContextNode");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/workflow/{workflowId}/process/{processId}/step/{stepId}/update_step:
     *   put:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: update the step
     *     summary: update the step
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
     *      - in: path
     *        name: stepId
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - newNameStep
     *               - newColor
     *             properties:
     *                newNameStep:
     *                 type: string
     *                newColor:
     *                 type: string
     *     responses:
     *       200:
     *         description: Success
     *       400:
     *         description: Bad request
     */
    app.put('/api/v1/workflow/:workflowId/process/:processId/step/:stepId/update_step', async (req, res) => {
        // check if workflowId, processId and stepId are valid
        if (!req.params.workflowId || isNaN(+req.params.workflowId))
            return res.status(400).send('Invalid workflowId');
        if (!req.params.processId || isNaN(+req.params.processId))
            return res.status(400).send('Invalid processId');
        if (!req.params.stepId || isNaN(+req.params.stepId))
            return res.status(400).send('Invalid stepId');
        if (!req.body.newNameStep || !req.body.newColor)
            return res.status(400).send('Missing required fields');
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const [workflowContextNode, processNode, stepNode] = await Promise.all([
                (0, getWorkflowContextNode_1.getWorkflowContextNode)(spinalAPIMiddleware, profileId, req.params.workflowId),
                spinalAPIMiddleware.load(parseInt(req.params.processId, 10), profileId),
                spinalAPIMiddleware.load(parseInt(req.params.stepId, 10), profileId),
            ]);
            // check if process and step are valid
            if (!(processNode instanceof spinal_env_viewer_graph_service_1.SpinalNode) ||
                processNode.info.type.get() !== spinal_service_ticket_1.PROCESS_TYPE ||
                !processNode.belongsToContext(workflowContextNode)) {
                return res.status(400).send('Invalid process');
            }
            if (!(stepNode instanceof spinal_env_viewer_graph_service_1.SpinalNode) ||
                stepNode.info.type.get() !== spinal_service_ticket_1.STEP_TYPE ||
                !stepNode.belongsToContext(workflowContextNode)) {
                return res.status(400).send('Invalid step');
            }
            const stepNodes = await (0, spinal_service_ticket_1.getStepNodesFromProcess)(processNode, workflowContextNode);
            if (stepNodes.some((node) => node.info.name.get() === req.body.newNameStep)) {
                return res.status(400).send('Step name already exists');
            }
            stepNode.info.name.set(req.body.newNameStep);
            stepNode.info.color.set(req.body.newColor);
            return res.status(200).json({
                dynamicId: stepNode._server_id,
                staticId: stepNode.getId().get(),
                name: stepNode.info.name.get(),
                color: stepNode.info.color.get(),
            });
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send(error.message);
        }
    });
};
//# sourceMappingURL=updateStep.js.map