import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { SpinalNode } from "spinal-model-graph";
import { fileFormat, serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { getHubUrl } from "../utils";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
	 * @swagger
	 * /api/v1/documentary/file/linked_to_node/{nodeId}:
	 *   get:
	 *     security:
	 *       - bearerAuth:
	 *           - readOnly
	 *     summary: Get files linked to a node
	 *     description: Returns all files linked to a node in the requested format.
	 *     tags:
	 *       - Documentary
	 *     parameters:
	 *       - in: path
	 *         name: nodeId
	 *         required: true
	 *         description: Dynamic identifier of the target node.
	 *         schema:
	 *           type: integer
	 *           format: int64
	 *       - in: query
	 *         name: format
	 *         required: false
	 *         description: Output format for each file.
	 *         schema:
	 *           type: string
	 *           default: buffer
	 *     responses:
	 *       200:
	 *         description: Files linked to the node returned successfully.
	 *       400:
	 *         description: Invalid node id.
	 *       404:
	 *         description: Node not found.
	 *       500:
	 *         description: Internal server error.
	 */
	app.get("/api/v1/documentary/file/linked_to_node/:nodeId", async (req, res, next) => {
		try {
			const profileId = getProfileId(req);
			const nodeId = parseInt(req.params.nodeId, 10);
			if (isNaN(nodeId)) return res.status(400).send({ message: "Invalid nodeId" });

			const node = await spinalAPIMiddleware.load<SpinalNode>(nodeId, profileId);
			if (!node) return res.status(404).send({ message: `No node found with id ${nodeId}` });

			let format: fileFormat = (req.query?.format as fileFormat) || "buffer";
			const hubUrl = getHubUrl(spinalAPIMiddleware);

			const files = await serviceDocumentation.getFileLinkedToNodeToSpecificFormat(node, format, hubUrl);
			return res.status(200).send(files);

			// Route initialization goes here.
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
