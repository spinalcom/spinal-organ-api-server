"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/ticket/{ticketId}/add_doc:
     *   post:
     *     security:
     *       - OauthSecurity:
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
    app.post('/api/v1/ticket/:ticketId/add_doc', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            // var workflow = await spinalAPIMiddleware.load(parseInt(req.body.workflowId, 10));
            // //@ts-ignore
            // SpinalGraphService._addNode(workflow)
            var ticket = yield spinalAPIMiddleware.load(parseInt(req.params.ticketId, 10));
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
                //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
                //@ts-ignore
                let avatar = req.files.file;
                //Use the mv() method to place the file in upload directory (i.e. "uploads")
                // avatar.mv('./uploads/' + avatar.name);
                var user = { username: 'api', userId: 0 };
                var data = {
                    name: avatar.name,
                    buffer: avatar.data,
                };
                yield spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addFileAsNote(ticket, data, user);
                // send response
                res.send({
                    status: true,
                    message: 'File is uploaded',
                    data: {
                        name: avatar.name,
                        mimetype: avatar.mimetype,
                        size: avatar.size,
                    },
                });
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).send('ko');
        }
        // res.json();
    }));
};
//# sourceMappingURL=ticketAddDoc.js.map