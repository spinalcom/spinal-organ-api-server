import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { SpinalNode } from "spinal-env-viewer-graph-service";
import { _formatFileVersion, getHubUrl } from "../utils";
import { fileFormat, serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
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
			const profileId = getProfileId(req);
			const fileDynamicId = parseInt(req.params.nodeId, 10);
			if (isNaN(fileDynamicId)) return res.status(400).send({ message: "Invalid fileDynamicId" });

			const fileNode = await spinalAPIMiddleware.load<SpinalNode>(fileDynamicId, profileId);
			if (!fileNode) return res.status(404).send({ message: `No file found with id ${fileDynamicId}` });

			const versions = await serviceDocumentation.getFileVersions(fileNode);
			if (!versions || versions.length === 0) return res.status(404).send({ message: `No versions found for file with id ${fileDynamicId}` });

			let format: fileFormat = req.query?.format as fileFormat;
			const hubUrl = getHubUrl(spinalAPIMiddleware);
			const fileName = fileNode.info?.name?.get() || fileNode.name?.get();

			const versionDataPromises = versions.map(async (version) => {
				const formattedVersion = _formatFileVersion(version, fileName);
				if (format) formattedVersion.data = await version.getAsSpecialFormat(format, hubUrl);
				return formattedVersion;
			});
			const versionData = await Promise.all(versionDataPromises);
			res.status(200).send(versionData);
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
