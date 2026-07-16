"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/file/parents/{fileId}:
     *   get:
     *     security:
     *       - bearerAuth:
     *           - readOnly
     *     summary: Get parent nodes of a file
     *     description: Returns all parent nodes of a file in the requested format.
     *     tags:
     *       - Documentary
     *     parameters:
     *       - in: path
     *         name: fileId
     *         required: true
     *         description: Dynamic identifier of the target file.
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: query
     *         name: format
     *         required: false
     *         description: Output format for each file.
     *         schema:
     *           type: string
     *           default: buffer
     *     responses:
     *       200:
     *         description: Parent nodes of the file returned successfully.
     *       400:
     *         description: Invalid file id.
     *       404:
     *         description: File not found.
     *       500:
     *         description: Internal server error.
     */
    app.get("/api/v1/documentary/file/parents/:fileId", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const fileId = parseInt(req.params.fileId, 10);
            if (isNaN(fileId))
                return res.status(400).send({ message: "Invalid fileId" });
            const node = await spinalAPIMiddleware.load(fileId, profileId);
            if (!node)
                return res.status(404).send({ message: `No file found with id ${fileId}` });
            //@ts-ignore
            const nodes = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getFileParents(node);
            const formattedNodes = nodes.map((parentNode) => ({
                dynamicId: parentNode._server_id,
                ...parentNode.info.get(),
            }));
            return res.status(200).send(formattedNodes);
            // Route initialization goes here.
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(500).send({ message: error.message });
        }
    });
};
//# sourceMappingURL=getFileParents.js.map