import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { fileFormat, serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalNode } from "spinal-model-graph";
import { getHubUrl } from "../utils";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
	 * @swagger
	 * /api/v1/documentary/file/{nodeId}/versions/{versionName}:
	 *   get:
	 *     security:
	 *       - bearerAuth:
	 *           - readOnly
	 *     summary: Get one file version
	 *     description: Returns one file version selected by version id or name.
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
	 *       - in: path
	 *         name: versionName
	 *         required: true
	 *         description: Version name or version id.
	 *         schema:
	 *           type: string
	 *       - in: query
	 *         name: format
	 *         required: false
	 *         description: Output format for the selected version.
	 *         schema:
	 *           type: string
	 *           default: buffer
	 *     responses:
	 *       200:
	 *         description: Version returned successfully.
	 *       400:
	 *         description: Invalid file id.
	 *       404:
	 *         description: File or version not found.
	 *       500:
	 *         description: Internal server error.
	 */
	app.get("/api/v1/documentary/file/:nodeId/versions/:versionName", async (req, res, next) => {
		try {
			const profileId = getProfileId(req);
			const fileDynamicId = parseInt(req.params.nodeId, 10);
			if (isNaN(fileDynamicId)) return res.status(400).send({ message: "Invalid fileDynamicId" });

			const fileNode = await spinalAPIMiddleware.load<SpinalNode>(fileDynamicId, profileId);
			if (!fileNode) return res.status(404).send({ message: `No file found with id ${fileDynamicId}` });

			const versions = await serviceDocumentation.getFileVersions(fileNode);
			if (!versions || versions.length === 0) return res.status(404).send({ message: `No versions found for file with id ${fileDynamicId}` });

			let format: fileFormat = (req.query?.format as fileFormat) || "buffer";
			const hubUrl = getHubUrl(spinalAPIMiddleware);

			const versionFound = versions.find((version) => version.id.get() === req.params.versionName || version.name.get() === req.params.versionName);
			if (!versionFound) return res.status(404).send({ message: `No version found with name ${req.params.versionName}` });

			const versionData = await versionFound.getAsSpecialFormat(format, hubUrl);
			res.status(200).send(versionData);
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
