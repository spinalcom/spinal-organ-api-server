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
const spinal_service_ticket_1 = require("spinal-service-ticket");
module.exports = function (logger, app) {
    /**
     * @swagger
     * /api/v1/workflow/{id}/nodeTypeList:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the node types used by workflows
     *     description: >-
     *       Returns the fixed list of node types the ticketing service uses : the workflow context type,
     *       the process type, the step type and the ticket type.
     *
     *
     *       This is a **constant** : the `id` in the path is not read, the workflow is never loaded, and
     *       the answer is the same for any value. It is there to mirror the `nodeTypeList` route of the
     *       other contexts.
     *     tags:
     *       - Workflow & ticket
     *     parameters:
     *       - in: path
     *         name: id
     *         description: Not used. Any value is accepted.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     responses:
     *       200:
     *         description: The node types used by workflows.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/WorkflowNodeTypeList'
     */
    app.get('/api/v1/workflow/:id/nodeTypeList', async (req, res) => {
        return res
            .status(200)
            .json([
            spinal_service_ticket_1.TICKET_CONTEXT_TYPE,
            spinal_service_ticket_1.PROCESS_TYPE,
            spinal_service_ticket_1.STEP_TYPE,
            spinal_service_ticket_1.SPINAL_TICKET_SERVICE_TICKET_TYPE,
        ]);
    });
};
//# sourceMappingURL=workflowTypeList.js.map