import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { fileFormat, serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalNode } from "spinal-model-graph";
import { _formatFileVersion, getHubUrl } from "../utils";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
	 * @swagger
	 * /api/v1/documentary/file/downgrade_file_version/{fileId}/{versionName}:
	 *   post:
	 *     security:
	 *       - bearerAuth:
	 *           - write
	 *     summary: Downgrade file version
	 *     description: Removes the current file version if the provided version name matches the actual previous version.
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
	 *       - in: path
	 *         name: versionName
	 *         required: true
	 *         description: Name of the previous version to downgrade to.
	 *         schema:
	 *           type: string
	 *       - in: query
	 *         name: format
	 *         required: false
	 *         description: Output format for the downgraded current version.
	 *         schema:
	 *           type: string
	 *           default: buffer
	 *     responses:
	 *       200:
	 *         description: File version downgraded successfully.
	 *       400:
	 *         description: Invalid file id, missing previous version name, or previous version mismatch.
	 *       404:
	 *         description: File or versions not found.
	 *       500:
	 *         description: Internal server error.
	 */
	app.post("/api/v1/documentary/file/downgrade_file_version/:fileId/:versionName", async (req, res, next) => {
		try {
			const profileId = getProfileId(req);
			const fileId = parseInt(req.params.fileId, 10);
			if (isNaN(fileId)) return res.status(400).send({ message: "Invalid fileId" });
			const requestedPreviousVersionName = req.params.versionName;
			if (!requestedPreviousVersionName) return res.status(400).send({ message: "Missing versionName" });

			const fileNode = await spinalAPIMiddleware.load<SpinalNode>(fileId, profileId);
			if (!fileNode) return res.status(404).send({ message: `No file found with id ${fileId}` });

			const downgradedCurrentVersion = await serviceDocumentation.downgradeFileVersion(fileNode, requestedPreviousVersionName);

			const fileName = fileNode?.info?.name?.get() || fileNode?.name?.get();
			const response = {
				message: `File version downgraded to ${downgradedCurrentVersion?.version?.get?.()}`,
				downgradedFrom: requestedPreviousVersionName,
				currentVersion: _formatFileVersion(downgradedCurrentVersion, fileName),
			};

			let format: fileFormat = req.query?.format as fileFormat;
			if (format) {
				const hubUrl = getHubUrl(spinalAPIMiddleware);
				response.currentVersion.data = await downgradedCurrentVersion.getAsSpecialFormat(format, hubUrl);
			}

			return res.status(200).send(response);
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
