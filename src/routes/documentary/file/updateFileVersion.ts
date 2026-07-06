import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { fileFormat, serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalNode } from "spinal-model-graph";
import { _formatFileVersion, getHubUrl, waitUntilServerIdNotDefined } from "../utils";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
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
			if (!req.files || !req.files.file) return res.status(400).send({ message: "No file uploaded" });
			const profileId = getProfileId(req);

			const fileId = parseInt(req.params.fileId, 10);
			if (isNaN(fileId)) return res.status(400).send({ message: "Invalid fileId" });

			const file = await spinalAPIMiddleware.load<SpinalNode>(fileId, profileId);
			if (!file) return res.status(404).send({ message: `No file found with id ${fileId}` });
			const { name } = req.body;
			const fileVersion = await serviceDocumentation.updateFileVersion(file, req.files.file, name);
			await waitUntilServerIdNotDefined(fileVersion);

			const hubUrl = getHubUrl(spinalAPIMiddleware);
			const fileName = file instanceof SpinalNode ? file.getName().get() : (file as any).name.get();

			const fileFormatted = _formatFileVersion(fileVersion, fileName);
			if (req.query?.format) fileFormatted.data = await fileVersion.getAsSpecialFormat(req.query.format as fileFormat, hubUrl);

			return res.status(200).send(fileFormatted);
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
