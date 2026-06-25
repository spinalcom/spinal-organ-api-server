"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/file/remove_from_context/{documentId}:
     *   delete:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Remove file from context
     *     description: Removes a file node from its documentary context.
     *     tags:
     *       - Documentary
     *     parameters:
     *       - in: path
     *         name: documentId
     *         required: true
     *         description: Dynamic id of the document file node.
     *         schema:
     *           type: integer
     *           format: int64
     *     responses:
     *       200:
     *         description: File removed successfully.
     *       400:
     *         description: Invalid file id or operation failed.
     *       500:
     *         description: Internal server error.
     */
    app.delete("/api/v1/documentary/file/remove_from_context/:documentId", async (req, res, next) => {
        try {
            const documentId = parseInt(req.params.documentId, 10);
            if (isNaN(documentId))
                return res.status(400).send({ message: "fileId must be a number" });
            const fileNode = await spinalAPIMiddleware.load(documentId);
            if (!fileNode)
                return res.status(400).send({ message: "fileId not found" });
            const removed = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.removeFileFromContext(fileNode);
            const statusCode = removed ? 200 : 400;
            const message = removed ? "File removed from context successfully" : "Failed to remove file from context";
            return res.status(statusCode).send({ status: removed, message, data: { ...fileNode.info.get(), dynamicId: fileNode._server_id } });
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(500).send({ message: error.message });
        }
    });
};
//# sourceMappingURL=removeFileFromContext.js.map