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
    app.put("/api/v1/workflow/:workflowId/process/:processId/step/:stepId/update_step", async (req, res, next) => {
        try {
            await spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const workflow = await spinalAPIMiddleware.load(parseInt(req.params.workflowId, 10), profileId);
            const process = await spinalAPIMiddleware.load(parseInt(req.params.processId, 10), profileId);
            const step = await spinalAPIMiddleware.load(parseInt(req.params.stepId, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(process);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(step);
            const allSteps = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(process.getId().get(), ["SpinalSystemServiceTicketHasStep"]);
            for (let index = 0; index < allSteps.length; index++) {
                const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(allSteps[index].id.get());
                if (realNode.getName().get() === req.body.newNameStep || req.body.newNameStep === "string") {
                    return res.status(400).send("the name of step already exists or invalid name string");
                }
            }
            if (workflow instanceof spinal_env_viewer_graph_service_1.SpinalContext && process.belongsToContext(workflow) && step.belongsToContext(workflow)) {
                if (workflow.getType().get() === "SpinalSystemServiceTicket") {
                    step.info.name.set(req.body.newNameStep);
                    step.info.color.set(req.body.newColor);
                }
                else {
                    return res.status(400).send("this context is not a SpinalSystemServiceTicket");
                }
            }
            else {
                res.status(400).send("node not found in context");
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send(error.message);
        }
        res.json();
    });
};
//# sourceMappingURL=updateStep.js.map