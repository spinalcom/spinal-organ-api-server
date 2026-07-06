"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const utils_1 = require("../utils");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/file/linked_to_node/{nodeId}:
     *   get:
     *     security:
     *       - bearerAuth:
     *           - readOnly
     *     summary: Get files linked to a node
     *     description: Returns all files linked to a node in the requested format.
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
     *       - in: query
     *         name: format
     *         required: false
     *         description: Output format for each file.
     *         schema:
     *           type: string
     *           default: buffer
     *     responses:
     *       200:
     *         description: Files linked to the node returned successfully.
     *       400:
     *         description: Invalid node id.
     *       404:
     *         description: Node not found.
     *       500:
     *         description: Internal server error.
     */
    app.get("/api/v1/documentary/file/linked_to_node/:nodeId", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const nodeId = parseInt(req.params.nodeId, 10);
            if (isNaN(nodeId))
                return res.status(400).send({ message: "Invalid nodeId" });
            const node = await spinalAPIMiddleware.load(nodeId, profileId);
            if (!node)
                return res.status(404).send({ message: `No node found with id ${nodeId}` });
            let format = req.query?.format;
            const hubUrl = (0, utils_1.getHubUrl)(spinalAPIMiddleware);
            const files = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getFileLinkedToNodeToSpecificFormat(node, format, hubUrl);
            return res.status(200).send(files);
            // Route initialization goes here.
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(500).send({ message: error.message });
        }
    });
};
//# sourceMappingURL=getFileLinkedToNode.js.map