import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalNode } from "spinal-model-graph";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
	 * @swagger
	 * /api/v1/documentary/file/{fileId}/versions/{versionName}:
	 *   delete:
	 *     security:
	 *       - bearerAuth:
	 *           - write
	 *     summary: Remove one file version
	 *     description: Removes one file version selected by version name.
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
	 *         description: Version name to remove.
	 *         schema:
	 *           type: string
	 *     responses:
	 *       200:
	 *         description: Version removed successfully.
	 *       400:
	 *         description: Invalid file id.
	 *       404:
	 *         description: File or version not found.
	 *       500:
	 *         description: Internal server error.
	 */
	app.delete("/api/v1/documentary/file/:fileId/versions/:versionName", async (req, res, next) => {
		try {
			const profileId = getProfileId(req);
			const fileDynamicId = parseInt(req.params.fileId, 10);
			if (isNaN(fileDynamicId)) return res.status(400).send({ message: "Invalid fileId" });

			const fileNode = await spinalAPIMiddleware.load<SpinalNode>(fileDynamicId, profileId);
			if (!fileNode) return res.status(404).send({ message: `No file found with id ${fileDynamicId}` });

			const versionName = req.params.versionName;
			return serviceDocumentation
				.removeFileVersion(fileNode, versionName)
				.then((removed) => {
					if (!removed) return res.status(404).send({ message: `No version found with name ${versionName}` });
					return res.status(200).send({ message: `Version ${versionName} removed successfully` });
				})
				.catch((err) => {
					return res.status(400).send({ message: err.message });
				});
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
