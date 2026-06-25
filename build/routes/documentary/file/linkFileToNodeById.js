"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/file/{fileId}/link_to_node/{nodeId}:
     *   post:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Link existing file to node
     *     description: Links an existing file node to another target node.
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
     *       - in: path
     *         name: nodeId
     *         required: true
     *         description: Dynamic identifier of the target node.
     *         schema:
     *           type: integer
     *           format: int64
     *     responses:
     *       200:
     *         description: File linked to node successfully.
     *       400:
     *         description: Invalid file id or node id.
     *       404:
     *         description: File or node not found.
     *       500:
     *         description: Internal server error.
     */
    app.post("/api/v1/documentary/file/:fileId/link_to_node/:nodeId", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const fileDynamicId = parseInt(req.params.fileId, 10);
            const nodeDynamicId = parseInt(req.params.nodeId, 10);
            if (isNaN(fileDynamicId))
                return res.status(400).send({ message: "Invalid fileId" });
            if (isNaN(nodeDynamicId))
                return res.status(400).send({ message: "Invalid nodeId" });
            const fileNode = await spinalAPIMiddleware.load(fileDynamicId, profileId);
            if (!fileNode)
                return res.status(404).send({ message: `No file found with id ${fileDynamicId}` });
            const targetNode = await spinalAPIMiddleware.load(nodeDynamicId, profileId);
            if (!targetNode)
                return res.status(404).send({ message: `No node found with id ${nodeDynamicId}` });
            const nodeInfo = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.linkFileToNode(targetNode, fileNode);
            if (!nodeInfo)
                return res.status(500).send({ message: `Failed to link file with id ${fileDynamicId} to node with id ${nodeDynamicId}` });
            return res.status(200).send({
                name: nodeInfo.getName().get(),
                id: nodeInfo.getId().get(),
                type: nodeInfo.getType().get(),
                dynamicId: nodeInfo._server_id,
            });
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(500).send({ message: error.message });
        }
    });
};
//# sourceMappingURL=linkFileToNodeById.js.map