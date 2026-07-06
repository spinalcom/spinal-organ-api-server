"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const utils_1 = require("../utils");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/file/{nodeId}/versions:
     *   get:
     *     security:
     *       - bearerAuth:
     *           - readOnly
     *     summary: Get all file versions
     *     description: Returns all versions of a file in the requested format.
     *     tags:
     *       - Documentary
     *     parameters:
     *       - in: path
     *         name: nodeId
     *         required: true
     *         description: Dynamic identifier of the file node.
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: query
     *         name: format
     *         required: false
     *         description: Output format for each version.
     *         schema:
     *           type: string
     *           default: buffer
     *     responses:
     *       200:
     *         description: Versions returned successfully.
     *       400:
     *         description: Invalid file id.
     *       404:
     *         description: File or versions not found.
     *       500:
     *         description: Internal server error.
     */
    app.get("/api/v1/documentary/file/:nodeId/versions", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const fileDynamicId = parseInt(req.params.nodeId, 10);
            if (isNaN(fileDynamicId))
                return res.status(400).send({ message: "Invalid fileDynamicId" });
            const fileNode = await spinalAPIMiddleware.load(fileDynamicId, profileId);
            if (!fileNode)
                return res.status(404).send({ message: `No file found with id ${fileDynamicId}` });
            const versions = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getFileVersions(fileNode);
            if (!versions || versions.length === 0)
                return res.status(404).send({ message: `No versions found for file with id ${fileDynamicId}` });
            let format = req.query?.format;
            const hubUrl = (0, utils_1.getHubUrl)(spinalAPIMiddleware);
            const fileName = fileNode.info?.name?.get() || fileNode.name?.get();
            const versionDataPromises = versions.map(async (version) => {
                const formattedVersion = (0, utils_1._formatFileVersion)(version, fileName);
                if (format)
                    formattedVersion.data = await version.getAsSpecialFormat(format, hubUrl);
                return formattedVersion;
            });
            const versionData = await Promise.all(versionDataPromises);
            res.status(200).send(versionData);
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(500).send({ message: error.message });
        }
    });
};
//# sourceMappingURL=getFileVersions.js.map