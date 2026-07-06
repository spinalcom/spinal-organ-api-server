import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { getHubUrl } from "../utils";
import { fileFormat, serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalNode } from "spinal-model-graph";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
	 * @swagger
	 * /api/v1/documentary/file/file_in_tree/{startNodeId}:
	 *   get:
	 *     security:
	 *       - bearerAuth:
	 *           - readOnly
	 *     summary: Get files in tree
	 *     description: Returns all files found in a tree starting from the provided node.
	 *     tags:
	 *       - Documentary
	 *     parameters:
	 *       - in: path
	 *         name: startNodeId
	 *         required: true
	 *         description: Dynamic id of the start node.
	 *         schema:
	 *           type: integer
	 *           format: int64
	 *       - in: query
	 *         name: format
	 *         required: false
	 *         description: Output format for returned files.
	 *         schema:
	 *           type: string
	 *           default: buffer
	 *     responses:
	 *       200:
	 *         description: Files returned successfully.
	 *       400:
	 *         description: Invalid start node id.
	 *       404:
	 *         description: Start node not found.
	 *       500:
	 *         description: Internal server error.
	 */
	app.get("/api/v1/documentary/file/file_in_tree/:startNodeId", async (req, res, next) => {
		try {
			const profileId = getProfileId(req);
			const nodeDynamicId = parseInt(req.params.startNodeId, 10);
			if (isNaN(nodeDynamicId)) return res.status(400).send({ message: "Invalid node DynamicId" });

			const node = await spinalAPIMiddleware.load<SpinalNode>(nodeDynamicId, profileId);
			if (!node) return res.status(404).send({ message: `No node found with id ${nodeDynamicId}` });

			let format: fileFormat = req.query?.format as fileFormat;
			const hubUrl = getHubUrl(spinalAPIMiddleware);

			const data = await serviceDocumentation.getFilesInTreeToSpecificFormat(node, format, hubUrl);
			return res.status(200).send(data);
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
