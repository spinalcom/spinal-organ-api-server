"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
    * @swagger
    * /api/v1/workflow/{workflowId}/process/{processId}/delete_process:
    *   delete:
    *     security:
    *       - bearerAuth:
    *         - read
    *     description: Delete a process
    *     summary: delete an process
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
    *         description: Delete Successfully
    *       400:
    *         description: Bad request
    */
    app.delete("/api/v1/workflow/:workflowId/process/:processId/delete_process", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const workflow = await spinalAPIMiddleware.load(parseInt(req.params.workflowId, 10), profileId);
            const process = await spinalAPIMiddleware.load(parseInt(req.params.processId, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(process);
            if (workflow instanceof spinal_env_viewer_graph_service_1.SpinalContext && process.belongsToContext(workflow)) {
                if (workflow.getType().get() === "SpinalSystemServiceTicket") {
                    process.removeFromGraph();
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
            res.status(500).send(error.message);
        }
        res.json();
    });
};
//# sourceMappingURL=deleteProcess.js.map