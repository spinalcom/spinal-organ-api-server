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
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/ticket/{ticketId}/add_doc:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: Uploads a Doc
     *     summary: Uploads a Doc
     *     tags:
     *       - Workflow & ticket
     *     parameters:
     *       - in: path
     *         name: ticketId
     *         description: use the dynamic ID
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     requestBody:
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *           encoding:
     *             file:
     *               style: form
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - workflowId
     *             properties:
     *               workflowId:
     *                 type: number
     *     responses:
     *       200:
     *         description: Add Successfully
     *       400:
     *         description: Add not Successfully
     */
    app.post('/api/v1/ticket/:ticketId/add_doc', async (req, res, next) => {
        try {
            // var workflow = await spinalAPIMiddleware.load(parseInt(req.body.workflowId, 10));
            // //@ts-ignore
            // SpinalGraphService._addNode(workflow)
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ticket = await spinalAPIMiddleware.load(parseInt(req.params.ticketId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(ticket);
            // @ts-ignore
            if (!req.files) {
                res.send({
                    status: false,
                    message: 'No file uploaded',
                });
            }
            else {
                //@ts-ignore
                const file = req.files.file;
                const data = {
                    name: file.name,
                    buffer: file.data,
                };
                await spinal_env_viewer_plugin_documentation_service_1.FileExplorer.uploadFiles(ticket, data);
                res.send({
                    status: true,
                    message: 'File is uploaded',
                    data: {
                        name: file.name,
                        mimetype: file.mimetype,
                        size: file.size,
                    },
                });
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send('ko');
        }
        // res.json();
    });
};
//# sourceMappingURL=ticketAddDoc.js.map