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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const awaitSync_1 = require("../../../utilities/awaitSync");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/workflow/create:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Create a workflow
     *     description: >-
     *       Creates a workflow context and adds it to the profile graph. Workflow names must be unique
     *       across **all** contexts of the twin, not only the workflows : a name already taken by any
     *       context is rejected with 400.
     *
     *
     *       `steps` optionally defines the default steps given to the processes of this workflow. Entries
     *       without a `name` or with a non-numeric `order` are silently dropped, and the kept ones are
     *       sorted by `order`. Steps start at order 1.
     *     tags:
     *       - Workflow & ticket
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - nameWorkflow
     *             properties:
     *               nameWorkflow:
     *                 type: string
     *                 description: Name of the workflow. Must not be used by any existing context.
     *               steps:
     *                 type: array
     *                 description: Optional default steps of the workflow's processes, starting at order 1.
     *                 items:
     *                   type: object
     *                   required:
     *                     - name
     *                     - order
     *                   properties:
     *                     name:
     *                       type: string
     *                     order:
     *                       type: number
     *                       description: Position of the step. Must be a number, otherwise the step is ignored.
     *                     color:
     *                       type: string
     *                       description: Optional display colour.
     *     responses:
     *       200:
     *         description: The created workflow.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/Workflow'
     *       400:
     *         description: >-
     *           `nameWorkflow` is not a string ("string nameWorkflow is invalide name"), or the name is
     *           already taken by a context ("the name context already exists").
     *       401:
     *         description: The profile is not allowed to write on the graph.
     *       500:
     *         description: Unexpected error while processing the request.
     */
    app.post('/api/v1/workflow/create', async (req, res) => {
        try {
            if (typeof req.body.nameWorkflow !== 'string') {
                return res.status(400).send('string nameWorkflow is invalide name');
            }
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const graph = await spinalAPIMiddleware.getGraph();
            // search if the context name already exists
            const contextNodes = await graph.getChildren('hasContext');
            if (contextNodes.some((child) => child.info.name?.get() === req.body.nameWorkflow))
                return res.status(400).send('the name context already exists');
            const steps = [];
            if (req.body.steps && Array.isArray(req.body.steps)) {
                for (const step of req.body.steps) {
                    if (step.name && typeof step.order === 'number') {
                        steps.push({
                            name: step.name,
                            color: step.color || undefined,
                            order: step.order,
                        });
                    }
                }
                steps.sort((a, b) => a.order - b.order);
            }
            const contextTicketNode = await (0, spinal_service_ticket_1.createTicketContext)(req.body.nameWorkflow, steps);
            if (userGraph._server_id != graph._server_id) {
                await userGraph.addContext(contextTicketNode);
            }
            await (0, awaitSync_1.awaitSync)(contextTicketNode);
            return res.status(200).json({
                dynamicId: contextTicketNode._server_id,
                name: contextTicketNode.info.name.get() || undefined,
                type: contextTicketNode.info.type.get() || undefined,
                staticId: contextTicketNode.info.id.get() || undefined,
            });
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error?.message);
        }
    });
};
//# sourceMappingURL=createWorkflow.js.map