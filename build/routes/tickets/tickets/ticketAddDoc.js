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
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
const spinal_service_ticket_1 = require("spinal-service-ticket");
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
    app.post('/api/v1/ticket/:ticketId/add_doc', async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ticket = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parseInt(req.params.ticketId, 10), profileId, spinal_service_ticket_1.SPINAL_TICKET_SERVICE_TICKET_TYPE);
            // @ts-ignore
            if (!req.files) {
                return res.send({
                    status: false,
                    message: 'No file uploaded',
                });
            }
            //@ts-ignore
            const files = req.files.file;
            const list = Array.isArray(files) ? files : [files];
            if (list.length === 0) {
                return res.send({
                    status: false,
                    message: 'No file uploaded',
                });
            }
            if (list.length === 1)
                return res.send({
                    status: true,
                    message: 'File is uploaded',
                    data: {
                        name: list[0].name,
                        mimetype: list[0].mimetype,
                        size: list[0].size,
                    },
                });
            const resData = [];
            for (const element of list) {
                const data = {
                    name: element.name,
                    buffer: element.data,
                };
                await spinal_env_viewer_plugin_documentation_service_1.FileExplorer.uploadFiles(ticket, data);
                resData.push({
                    name: element.name,
                    mimetype: element.mimetype,
                    size: element.size,
                });
            }
            return res.send({
                status: true,
                message: 'Files are uploaded',
                data: resData,
            });
        }
        catch (error) {
            if (error?.code && error?.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send('ko');
        }
    });
};
//# sourceMappingURL=ticketAddDoc.js.map