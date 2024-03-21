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
const spinal_service_ticket_1 = require("spinal-service-ticket");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/workflow/{workflowId}/process/{processId}/update:
     *   put:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: update the process
     *     summary: update the process
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
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - newNameProcess
     *             properties:
     *                newNameProcess:
     *                 type: string
     *     responses:
     *       200:
     *         description: Success
     *       400:
     *         description: Bad request
     */
    app.put("/api/v1/workflow/:workflowId/process/:processId/update", async (req, res, next) => {
        try {
            await spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const workflow = await spinalAPIMiddleware.load(parseInt(req.params.workflowId, 10), profileId);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.processId, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            const allProcess = await spinal_service_ticket_1.serviceTicketPersonalized.getAllProcess(workflow.getId().get());
            for (let index = 0; index < allProcess.length; index++) {
                const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(allProcess[index].id.get());
                if (realNode.getName().get() === req.body.newNameProcess) {
                    return res.status(400).send("the name of process already exists");
                }
            }
            if (workflow instanceof spinal_env_viewer_graph_service_1.SpinalContext && node.belongsToContext(workflow)) {
                if (workflow.getType().get() === "SpinalSystemServiceTicket" && req.body.newNameProcess !== "string") {
                    node.info.name.set(req.body.newNameProcess);
                }
                else {
                    return res.status(400).send("this context is not a SpinalSystemServiceTicket or invalid name string");
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
//# sourceMappingURL=updateProcess.js.map