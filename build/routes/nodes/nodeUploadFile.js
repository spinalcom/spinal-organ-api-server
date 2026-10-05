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
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{id}/upload_file:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Attach a document to a node
     *     description: >-
     *       Uploads a file as `multipart/form-data` and stores it under the node's `hasFiles` child,
     *       where `/api/v1/node/{id}/file_list` then lists it. The form field **must** be named `file`;
     *       one file per request.
     *
     *
     *       Beware : when no file is sent the request still answers **200** with
     *       `{ "status": false, "message": "No file uploaded" }`, so check the `status` field rather than
     *       the HTTP code.
     *     tags:
     *       - Nodes
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the node the document is attached to.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - file
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *           encoding:
     *             file:
     *               style: form
     *     responses:
     *       200:
     *         description: >-
     *           The file was stored (`status: true`), or no file was sent at all (`status: false`, no
     *           `data`).
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 data:
     *                   type: object
     *                   description: Only present when a file was actually stored.
     *                   properties:
     *                     name:
     *                       type: string
     *                     mimetype:
     *                       type: string
     *                     size:
     *                       type: integer
     *                       description: Size in bytes.
     *       400:
     *         description: The node could not be loaded, or the file could not be stored.
     *       401:
     *         description: The profile is not allowed to write on this node.
     */
    app.post('/api/v1/node/:id/upload_file', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            // @ts-ignore
            if (!req.files) {
                res.send({
                    status: false,
                    message: 'No file uploaded',
                });
            }
            else {
                //Use the name of the input field (i.e. "file") to retrieve the uploaded file
                // @ts-ignore
                const file = req.files.file;
                //Use the mv() method to place the file in upload directory (i.e. "uploads")
                const data = {
                    name: file.name,
                    buffer: file.data,
                };
                await spinal_env_viewer_plugin_documentation_service_1.FileExplorer.uploadFiles(node, data);
                //send response
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
//# sourceMappingURL=nodeUploadFile.js.map