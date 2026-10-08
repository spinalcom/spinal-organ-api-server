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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/workflow/{id}/processList:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the processes of a workflow
     *     description: >-
     *       Returns the processes of a workflow context. A process is a ticket pipeline; its steps are
     *       listed by `/api/v1/workflow/{workflowId}/process/{processId}/stepList`.
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
     *     responses:
     *       200:
     *         description: The processes of the workflow (an empty array if there are none).
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Process'
     *       401:
     *         description: The profile is not allowed to read this workflow.
     *       500:
     *         description: The workflow could not be loaded, or it is not a workflow context.
     */
    app.get('/api/v1/workflow/:id/processList', async (req, res) => {
        try {
            await spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const workflowContextNode = await (0, getWorkflowContextNode_1.getWorkflowContextNode)(spinalAPIMiddleware, profileId, req.params.id);
            const processNodes = await (0, spinal_service_ticket_1.getAllTicketProcess)(workflowContextNode);
            const nodes = [];
            for (const processNode of processNodes) {
                const info = {
                    dynamicId: processNode._server_id,
                    staticId: processNode.info.id?.get() || undefined,
                    name: processNode.info.name?.get() || undefined,
                    type: processNode.info.type?.get() || undefined,
                    color: processNode.info.color?.get() || undefined,
                };
                nodes.push(info);
            }
            return res.json(nodes);
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error?.message);
        }
    });
};
//# sourceMappingURL=processList.js.map