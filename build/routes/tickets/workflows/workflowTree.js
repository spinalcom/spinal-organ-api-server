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
const recTree_1 = require("../../../utilities/recTree");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
const spinal_service_ticket_1 = require("spinal-service-ticket");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/workflow/{id}/tree:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Get the whole tree of a workflow
     *     description: >-
     *       Returns a workflow context with everything below it : its processes, their steps and the
     *       tickets sitting in each step. On a busy workflow this response is large, since every ticket
     *       appears in it.
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
     *         description: The workflow and its descendants.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/ContextTree'
     *       400:
     *         description: The node is not a workflow context ("The ID is not a workflow").
     *       401:
     *         description: The profile is not allowed to read this workflow.
     *       500:
     *         description: The workflow could not be loaded or the tree could not be built.
     */
    app.get('/api/v1/workflow/:id/tree', async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const workflow = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parseInt(req.params.id, 10), profileId, spinal_service_ticket_1.TICKET_CONTEXT_TYPE);
            if (workflow instanceof spinal_model_graph_1.SpinalContext) {
                const workflows = {
                    dynamicId: workflow._server_id,
                    staticId: workflow.info.id?.get() || undefined,
                    name: workflow.info.name?.get() || undefined,
                    type: workflow.info.type?.get() || undefined,
                    children: await (0, recTree_1.recTree)(workflow, workflow),
                };
                return res.json(workflows);
            }
            return res.status(400).send('The ID is not a workflow');
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error?.message);
        }
    });
};
//# sourceMappingURL=workflowTree.js.map