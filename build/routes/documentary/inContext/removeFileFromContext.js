"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/file/remove_from_context/{contextId}/{documentId}:
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
     *         name: contextId
     *         required: true
     *         description: Dynamic id of the documentary context node.
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: path
     *         name: documentId
     *         required: true
     *         description: Dynamic id of the document file node.
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: query
     *         name: unlink
     *         required: false
     *         description: If set to true or 1, the file node will be unlinked from its parent nodes after being removed from the context.
     *         schema:
     *           type: boolean
     *
     *     responses:
     *       200:
     *         description: File removed successfully.
     *       400:
     *         description: Invalid file id or operation failed.
     *       500:
     *         description: Internal server error.
     */
    app.delete("/api/v1/documentary/file/remove_from_context/:contextId/:documentId", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const contextId = parseInt(req.params.contextId, 10);
            if (isNaN(contextId))
                return res.status(400).send({ message: "contextId must be a number" });
            const documentId = parseInt(req.params.documentId, 10);
            if (isNaN(documentId))
                return res.status(400).send({ message: "documentId must be a number" });
            const contextNode = await spinalAPIMiddleware.load(contextId, profileId);
            if (!contextNode)
                return res.status(400).send({ message: "contextId not found" });
            let fileNode = await spinalAPIMiddleware.load(documentId, profileId);
            if (!fileNode)
                return res.status(400).send({ message: "documentId not found" });
            // remove the file from the context
            const unLinkQuery = req.query.unlink === "true" || req.query.unlink === "1";
            const removed = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.removeFileFromContext(fileNode, contextNode, unLinkQuery);
            // // If the unlink query parameter is set to true or 1, get the parent nodes of the file node
            // // and unlink the file node from its parents. This is useful for cleaning up references to the file node in the graph.
            // if (unLinkQuery && (unLinkQuery === "true" || unLinkQuery === "1")) {
            // 	const parentNodes = await serviceDocumentation.getFileParents(fileNode);
            // 	const unlinkPromises = parentNodes.map(async (parentNode: SpinalNode) => serviceDocumentation.unlinkFileFromNode(parentNode, fileNode));
            // 	await Promise.allSettled(unlinkPromises);
            // }
            const statusCode = removed ? 200 : 400;
            const message = removed ? "File removed from context successfully" : "Failed to remove file from context";
            if (fileNode instanceof spinal_env_viewer_plugin_documentation_service_1.SpinalDocument)
                fileNode = (await fileNode.getNode());
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