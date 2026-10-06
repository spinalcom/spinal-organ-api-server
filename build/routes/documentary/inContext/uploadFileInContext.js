"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const utils_1 = require("../utils");
/**
 * @swagger
 * components:
 *   schemas:
 *     DocumentaryUploadedFile:
 *       type: object
 *       description: Info of the created document node
 *       properties:
 *         name:
 *           type: string
 *         id:
 *           type: string
 *         type:
 *           type: string
 *         dynamicId:
 *           type: integer
 *           description: Dynamic id of the document node
 *     DocumentaryUploadFailure:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the uploaded file
 *         code:
 *           type: integer
 *           description: Reason as an HTTP code (400 empty name, 409 name already used, 500 storage error, 503 creation not confirmed by the hub)
 *         message:
 *           type: string
 */
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/upload_file_in_context/{contextId}/{parentId}:
     *   post:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Upload file in context
     *     description: >
     *       Uploads one or multiple files and attaches them under a parent node in a context. Names are unique
     *       within a directory (case and surrounding spaces ignored): a file whose name is already used in the
     *       parent directory, or twice in the request, is rejected with 409 and is not stored. Each file is
     *       processed independently. When some files fail, the response is 207 with { success, failed } rather
     *       than an error for the whole request, so that the client only retries the failed files (retrying
     *       all of them would duplicate the stored ones); the 200 response stays an array for compatibility.
     *     tags:
     *       - Documentary
     *     parameters:
     *       - in: path
     *         name: contextId
     *         required: true
     *         description: Dynamic id of the context node.
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: path
     *         name: parentId
     *         required: true
     *         description: Dynamic id of the parent node.
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
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: binary
     *     responses:
     *       200:
     *         description: All files uploaded successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/DocumentaryUploadedFile'
     *       207:
     *         description: Some files were uploaded, the others are listed in "failed".
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/DocumentaryUploadedFile'
     *                 failed:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/DocumentaryUploadFailure'
     *       400:
     *         description: Invalid request or missing file; also returned when no file was stored and the failures have different 4xx reasons (body { message, failed }).
     *       404:
     *         description: Context or parent node not found.
     *       409:
     *         description: No file stored, every file name is already used (body { message, failed }).
     *       413:
     *         description: A file exceeds the upload size limit (DOCUMENTARY_MAX_UPLOAD_MB, 200 MB by default).
     *       500:
     *         description: Internal server error, or no file stored (body { message, failed } when files were processed).
     *       503:
     *         description: No file confirmed by the hub in time (body { message, failed }).
     */
    app.post("/api/v1/documentary/upload_file_in_context/:contextId/:parentId", async (req, res, next) => {
        try {
            if (!req.files || !req.files.file)
                return res.status(400).send({ message: "No file uploaded" });
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const contextId = parseInt(req.params.contextId, 10);
            const parentId = parseInt(req.params.parentId, 10);
            if (isNaN(contextId))
                return res.status(400).send({ message: "Invalid contextId" });
            if (isNaN(parentId))
                return res.status(400).send({ message: "Invalid parentId" });
            const context = await spinalAPIMiddleware.load(contextId, profileId);
            if (!context)
                return res.status(404).send({ message: `No context found with id ${contextId}` });
            const parent = await (0, utils_1.toDocumentaryNode)(await spinalAPIMiddleware.load(parentId, profileId));
            if (!parent)
                return res.status(404).send({ message: `No parent found with id ${parentId}` });
            let files = req.files.file;
            if (!Array.isArray(files))
                files = [files];
            const { conflicts, release } = await (0, utils_1.reserveChildNames)(parent, files.map((file) => file.name));
            // Each file is stored on its own so that one failure does not discard the others.
            let results;
            try {
                results = await Promise.allSettled(files.map(async (file, index) => {
                    if (conflicts[index])
                        throw conflicts[index];
                    const [fileNode] = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addFileToNodeInContext(parent, file, context);
                    if (!fileNode)
                        throw { code: 500, message: "No node returned" };
                    await (0, utils_1.waitUntilServerIdNotDefined)(fileNode);
                    return { ...fileNode.info.get(), dynamicId: fileNode._server_id };
                }));
            }
            finally {
                release();
            }
            const success = [];
            const failed = [];
            results.forEach((result, index) => {
                if (result.status === "fulfilled")
                    success.push(result.value);
                else
                    failed.push({ name: files[index].name, code: result.reason?.code || 500, message: result.reason?.message || "Failed to upload file" });
            });
            if (failed.length === 0)
                return res.status(200).send(success);
            if (success.length > 0)
                return res.status(207).send({ success, failed });
            const codes = new Set(failed.map((failure) => failure.code));
            const status = codes.size === 1 ? failed[0].code : failed.every((failure) => failure.code < 500) ? 400 : 500;
            const message = failed.length === 1 ? failed[0].message : "No file could be uploaded";
            return res.status(status).send({ message, failed });
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(500).send({ message: error.message });
        }
    });
};
//# sourceMappingURL=uploadFileInContext.js.map