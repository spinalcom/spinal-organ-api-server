"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const utils_1 = require("../utils");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/file/{fileId}/details:
     *   get:
     *     security:
     *       - bearerAuth:
     *           - readOnly
     *     summary: Get file details
     *     description: Returns basic details of a documentary file.
     *     tags:
     *       - Documentary
     *     parameters:
     *       - in: path
     *         name: fileId
     *         required: true
     *         description: Dynamic identifier of the file node.
     *         schema:
     *           type: integer
     *           format: int64
     *     responses:
     *       200:
     *         description: File details returned successfully.
     *       400:
     *         description: Invalid file id.
     *       404:
     *         description: File not found.
     *       500:
     *         description: Internal server error.
     */
    app.get("/api/v1/documentary/file/:fileId/details", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const fileId = parseInt(req.params.fileId, 10);
            if (isNaN(fileId))
                return res.status(400).send({ message: "Invalid fileId" });
            let fileNode = await spinalAPIMiddleware.load(fileId, profileId);
            if (!fileNode)
                return res.status(404).send({ message: `No file found with id ${fileId}` });
            if (fileNode instanceof spinal_env_viewer_plugin_documentation_service_1.SpinalDocument)
                fileNode = (await fileNode.getNode());
            if (fileNode.getType().get() !== spinal_env_viewer_plugin_documentation_service_1.FILE_NODE_TYPE)
                return res.status(400).send({ message: `Node with id ${fileId} is not a file node` });
            const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const contexts = await (0, utils_1.getContexts)(fileNode, graph);
            const fileDetails = {
                ...fileNode.info.get(),
                dynamicId: fileNode._server_id,
                attributes: await (0, utils_1.getFileAttributes)(fileNode),
                contexts: contexts.map((context) => ({ dynamicId: context._server_id, ...context.info.get() })),
                parents: await (0, utils_1.getParents)(fileNode, contexts),
            };
            return res.status(200).send(fileDetails);
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(500).send({ message: error.message });
        }
    });
};
//# sourceMappingURL=readDetails.js.map