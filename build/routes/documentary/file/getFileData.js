"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const utils_1 = require("../utils");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/file/{fileDynamicId}:
     *   get:
     *     security:
     *       - bearerAuth:
     *           - readOnly
     *     summary: Get file data
     *     description: Returns a file content converted to the requested format.
     *     tags:
     *       - Documentary
     *     parameters:
     *       - in: path
     *         name: fileDynamicId
     *         required: true
     *         description: Dynamic identifier of the file node.
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: query
     *         name: format
     *         required: false
     *         description: Output format for the returned file data.
     *         schema:
     *           type: string
     *           default: buffer
     *     responses:
     *       200:
     *         description: File data returned successfully.
     *       400:
     *         description: Invalid file id.
     *       404:
     *         description: File not found.
     *       500:
     *         description: Internal server error.
     */
    app.get("/api/v1/documentary/file/:fileDynamicId", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const fileDynamicId = parseInt(req.params.fileDynamicId, 10);
            if (isNaN(fileDynamicId))
                return res.status(400).send({ message: "Invalid fileDynamicId" });
            const fileNode = await spinalAPIMiddleware.load(fileDynamicId, profileId);
            if (!fileNode)
                return res.status(404).send({ message: `No file found with id ${fileDynamicId}` });
            const fileData = (0, utils_1._formatFileNode)(fileNode);
            let format = req.query?.format;
            if (format) {
                const hubUrl = (0, utils_1.getHubUrl)(spinalAPIMiddleware);
                fileData.data = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.convertFileToSpecialFormat(fileNode, format, hubUrl);
            }
            return res.status(200).send(fileData);
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(500).send({ message: error.message });
        }
    });
};
//# sourceMappingURL=getFileData.js.map