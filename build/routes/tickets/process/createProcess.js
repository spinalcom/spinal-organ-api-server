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
const getWorkflowContextNode_1 = require("../../../utilities/workflow/getWorkflowContextNode");
const awaitSync_1 = require("src/utilities/awaitSync");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/workflow/{id}/create_process:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: create a Process
     *     summary: create a Process
     *     tags:
     *       - Workflow & ticket
     *     parameters:
     *      - in: path
     *        name: id
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
     *               - nameProcess
     *             properties:
     *               nameProcess:
     *                 type: string
     *     responses:
     *       200:
     *         description: Create Successfully
     *       400:
     *         description: create not Successfully
     */
    app.post('/api/v1/workflow/:id/create_process', async (req, res) => {
        try {
            await spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const workflowContextNode = await (0, getWorkflowContextNode_1.getWorkflowContextNode)(spinalAPIMiddleware, profileId, req.params.id);
            if (typeof req.body.nameProcess === 'string' &&
                req.body.nameProcess.length === 0) {
                return res.status(400).send('nameProcess is required');
            }
            const allProcess = await (0, spinal_service_ticket_1.getAllTicketProcess)(workflowContextNode);
            for (const processNode of allProcess) {
                if (processNode.info.name.get() === req.body.nameProcess) {
                    return res.status(400).send('The name process already exists');
                }
            }
            const processNode = await (0, spinal_service_ticket_1.createTicketProcess)(req.body.nameProcess, workflowContextNode);
            await (0, awaitSync_1.awaitSync)(processNode);
            const info = {
                dynamicId: processNode._server_id,
                staticId: processNode.info.id?.get(),
                name: processNode.info.name?.get(),
                type: processNode.info.type?.get(),
            };
            return res.json(info);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error.message);
        }
    });
};
//# sourceMappingURL=createProcess.js.map