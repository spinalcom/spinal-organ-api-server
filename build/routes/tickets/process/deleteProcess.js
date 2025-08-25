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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const getWorkflowContextNode_1 = require("../../../utilities/workflow/getWorkflowContextNode");
const spinal_service_ticket_1 = require("spinal-service-ticket");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/workflow/{workflowId}/process/{processId}/delete_process:
     *   delete:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: Delete a process
     *     summary: delete an process and steps but NOT the tickets
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
    app.delete('/api/v1/workflow/:workflowId/process/:processId/delete_process', async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const workflowContextNode = await (0, getWorkflowContextNode_1.getWorkflowContextNode)(spinalAPIMiddleware, profileId, req.params.workflowId);
            const processNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parseInt(req.params.processId, 10), profileId, spinal_service_ticket_1.PROCESS_TYPE);
            if (processNode.belongsToContext(workflowContextNode) === false)
                return res
                    .status(400)
                    .send('Process node does not belong to the workflow context');
            const stepNodes = await (0, spinal_service_ticket_1.getStepNodesFromProcess)(processNode, workflowContextNode);
            const proms = [];
            for (const stepNode of stepNodes) {
                proms.push(stepNode.removeFromGraph());
            }
            proms.push(processNode.removeFromGraph());
            await Promise.all(proms);
            return res.status(200).send('Delete Successfully');
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error?.message);
        }
    });
};
//# sourceMappingURL=deleteProcess.js.map