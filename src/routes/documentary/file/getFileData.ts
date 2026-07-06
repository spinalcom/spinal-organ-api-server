import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { fileFormat, serviceDocumentation, SpinalDocument } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalNode } from "spinal-model-graph";
import { File as SpinalFile } from "spinal-core-connectorjs_type";
import { _formatFileNode, getHubUrl } from "../utils";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
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
			const profileId = getProfileId(req);
			const fileDynamicId = parseInt(req.params.fileDynamicId, 10);

			if (isNaN(fileDynamicId)) return res.status(400).send({ message: "Invalid fileDynamicId" });

			const fileNode = await spinalAPIMiddleware.load<SpinalNode | SpinalDocument | SpinalFile>(fileDynamicId, profileId);
			if (!fileNode) return res.status(404).send({ message: `No file found with id ${fileDynamicId}` });

			const fileData = _formatFileNode(fileNode);

			let format: fileFormat = req.query?.format as fileFormat;

			if (format) {
				const hubUrl = getHubUrl(spinalAPIMiddleware);
				fileData.data = await serviceDocumentation.convertFileToSpecialFormat(fileNode, format, hubUrl);
			}

			return res.status(200).send(fileData);
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
