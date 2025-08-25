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
const spinal_model_graph_1 = require("spinal-model-graph");
const findOneInContext_1 = require("../../../utilities/findOneInContext");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_service_ticket_1 = require("spinal-service-ticket");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/workflow/{workflowId}/node/{nodeId}/find:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: find a node in workflow
     *     summary: find a node in workflow
     *     tags:
     *       - Workflow & ticket
     *     parameters:
     *       - in: path
     *         name: workflowId
     *         description: use the dynamic ID
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: path
     *         name: nodeId
     *         description: use the Static ID
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/Workflow'
     *       400:
     *         description: Bad request
     */
    app.get('/api/v1/workflow/:workflowId/node/:nodeId/find', async (req, res) => {
        try {
            await spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            //  check workflow
            const workflow = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parseInt(req.params.workflowId, 10), profileId, spinal_service_ticket_1.TICKET_CONTEXT_TYPE);
            let node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(req.params.nodeId);
            if (typeof node === 'undefined') {
                node = await (0, findOneInContext_1.findOneInContext)(workflow, workflow, (n) => n.info.id.get() === req.params.nodeId);
            }
            if (node instanceof spinal_model_graph_1.SpinalNode && node.belongsToContext(workflow)) {
                const info = {
                    dynamicId: node._server_id,
                    staticId: node.info.id.get() || undefined,
                    name: node.info.name.get() || undefined,
                    type: node.info.type.get() || undefined,
                };
                return res.json(info);
            }
            return res.status(404).send('node not found');
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error?.message);
        }
    });
};
//# sourceMappingURL=findNodeInWorkflow.js.map