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
// import getFiles from "../../utilities/getFiles";
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{id}/file_list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Returns files of node
     *     summary: Get list files of node
     *     tags:
     *       - Nodes
     *     parameters:
     *      - in: path
     *        name: id
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/File'
     *       400:
     *         description: Bad request
     */
    app.get("/api/v1/node/:id/file_list", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            if (!node) {
                return res.status(400).send(`No node found with id ${req.params.id}`);
            }
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            const filesNode = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getFileLinkedToNode(node);
            const filesFormatted = filesNode.map((file) => ({
                dynamicId: file._server_id,
                Name: file?.info?.name?.get() || file.name?.get(),
            }));
            return res.json(filesFormatted);
            // // Files
            // var _files = [];
            // const fileNode = (await node.getChildren("hasFiles"))[0];
            // if (fileNode) {
            // 	const filesfromElement = await fileNode.element.load();
            // 	for (let index = 0; index < filesfromElement.length; index++) {
            // 		const infoFiles = {
            // 			dynamicId: filesfromElement[index]._server_id,
            // 			Name: filesfromElement[index].name.get(),
            // 		};
            // 		_files.push(infoFiles);
            // 	}
            // }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("ko");
        }
        // res.json(_files);
    });
};
//# sourceMappingURL=nodeFileList.js.map