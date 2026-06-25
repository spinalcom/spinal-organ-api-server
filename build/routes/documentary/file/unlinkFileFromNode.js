"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/file/{fileId}/unlink_from_node/{nodeId}:
     *   post:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Unlink file from node
     *     description: Removes the relation between a file node and a target node.
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
     *         description: File unlinked from node successfully.
     *       400:
     *         description: Invalid file id or node id.
     *       404:
     *         description: File or node not found.
     *       500:
     *         description: Internal server error.
     */
    app.post("/api/v1/documentary/file/:fileId/unlink_from_node/:nodeId", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const nodeDynamicId = parseInt(req.params.nodeId, 10);
            const fileDynamicId = parseInt(req.params.fileId, 10);
            if (isNaN(nodeDynamicId))
                return res.status(400).send({ message: "Invalid nodeId" });
            if (isNaN(fileDynamicId))
                return res.status(400).send({ message: "Invalid fileId" });
            const node = await spinalAPIMiddleware.load(nodeDynamicId, profileId);
            if (!node)
                return res.status(404).send({ message: `No node found with id ${nodeDynamicId}` });
            const fileNode = await spinalAPIMiddleware.load(fileDynamicId, profileId);
            if (!fileNode)
                return res.status(404).send({ message: `No file found with id ${fileDynamicId}` });
            const removed = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.unlinkFileFromNode(node, fileNode);
            const statusCode = removed ? 200 : 400;
            const messaged = removed ? `File with id ${fileDynamicId} unlinked from node with id ${nodeDynamicId}` : `Failed to unlink file with id ${fileDynamicId} from node with id ${nodeDynamicId}`;
            res.status(statusCode).send({ message: messaged, removed });
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(500).send({ message: error.message });
        }
    });
};
//# sourceMappingURL=unlinkFileFromNode.js.map