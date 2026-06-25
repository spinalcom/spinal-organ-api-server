"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/file/link_to_node/{nodeId}:
     *   post:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Upload and link files to a node
     *     description: Uploads one or multiple files and links them to the target node.
     *     tags:
     *       - Documentary
     *     parameters:
     *       - in: path
     *         name: nodeId
     *         required: true
     *         description: Dynamic identifier of the target node.
     *         schema:
     *           type: integer
     *           format: int64
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
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: binary
     *     responses:
     *       200:
     *         description: Files uploaded and linked successfully.
     *       400:
     *         description: Invalid request or missing file.
     *       404:
     *         description: Node not found.
     *       500:
     *         description: Internal server error.
     */
    app.post("/api/v1/documentary/file/link_to_node/:nodeId", async (req, res, next) => {
        try {
            if (!req.files || !req.files.file)
                return res.status(400).send({ message: "No file uploaded" });
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const nodeId = parseInt(req.params.nodeId, 10);
            if (isNaN(nodeId))
                return res.status(400).send({ message: "Invalid nodeId" });
            const node = await spinalAPIMiddleware.load(nodeId, profileId);
            if (!node)
                return res.status(404).send({ message: `No node found with id ${nodeId}` });
            let files = req.files?.file;
            if (!Array.isArray(files))
                files = [files];
            const filesData = await spinal_env_viewer_plugin_documentation_service_1.FileExplorer.uploadFiles(node, files);
            const filesFormatted = filesData.map((file) => ({
                dynamicId: file._server_id,
                ...file.info.get(),
            }));
            return res.status(200).send({ message: "Files linked successfully", files: filesFormatted });
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(500).send({ message: error.message });
        }
    });
};
//# sourceMappingURL=linkFileToNode.js.map