"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const spinal_model_graph_1 = require("spinal-model-graph");
const utils_1 = require("../utils");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/file/update_file_version/{fileId}:
     *   post:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Upload a new file version
     *     description: Creates and returns a new version of an existing file.
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
     *                 type: string
     *                 format: binary
     *               name:
     *                 type: string
     *                 description: Optional name for the new file version.
     *     responses:
     *       200:
     *         description: File version updated successfully.
     *       400:
     *         description: Invalid request or missing file.
     *       404:
     *         description: File not found.
     *       500:
     *         description: Internal server error.
     */
    app.post("/api/v1/documentary/file/update_file_version/:fileId", async (req, res, next) => {
        try {
            if (!req.files || !req.files.file)
                return res.status(400).send({ message: "No file uploaded" });
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const fileId = parseInt(req.params.fileId, 10);
            if (isNaN(fileId))
                return res.status(400).send({ message: "Invalid fileId" });
            const file = await spinalAPIMiddleware.load(fileId, profileId);
            if (!file)
                return res.status(404).send({ message: `No file found with id ${fileId}` });
            const { name } = req.body;
            const fileVersion = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.updateFileVersion(file, req.files.file, name);
            await (0, utils_1.waitUntilServerIdNotDefined)(fileVersion);
            const hubUrl = (0, utils_1.getHubUrl)(spinalAPIMiddleware);
            const fileName = file instanceof spinal_model_graph_1.SpinalNode ? file.getName().get() : file.name.get();
            const fileFormatted = (0, utils_1._formatFileVersion)(fileVersion, fileName);
            if (req.query?.format)
                fileFormatted.data = await fileVersion.getAsSpecialFormat(req.query.format, hubUrl);
            return res.status(200).send(fileFormatted);
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(500).send({ message: error.message });
        }
    });
};
//# sourceMappingURL=updateFileVersion.js.map