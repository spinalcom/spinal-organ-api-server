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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_service_ticket_1 = require("spinal-service-ticket");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/workflow/{id}/read:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: read a workflow
     *     summary: read a workflow
     *     tags:
     *       - Workflow & ticket
     *     parameters:
     *       - in: path
     *         name: id
     *         description: use the dynamic ID
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
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
    app.get('/api/v1/workflow/:id/read', async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const workflow = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            if (workflow.info.type?.get() === spinal_service_ticket_1.TICKET_CONTEXT_TYPE) {
                const info = {
                    dynamicId: workflow._server_id,
                    staticId: workflow.getId().get(),
                    name: workflow.getName().get(),
                    type: workflow.getType().get(),
                };
                return res.json(info);
            }
            else {
                return res
                    .status(400)
                    .send(`this context is not a '${spinal_service_ticket_1.TICKET_CONTEXT_TYPE}'`);
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(500).send(error.message);
        }
    });
};
//# sourceMappingURL=readWorkflow.js.map