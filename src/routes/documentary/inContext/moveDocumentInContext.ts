import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { serviceDocumentation, SpinalDocument } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalNode } from "spinal-env-viewer-graph-service";
import { getProfileId } from "../../../utilities/requestUtilities";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
	 * @swagger
	 * /api/v1/documentary/move_document_in_context:
	 *   post:
	 *     security:
	 *       - bearerAuth:
	 *           - write
	 *     summary: Move document in context
	 *     description: Moves a document from a source node to a target node inside a context.
	 *     tags:
	 *       - Documentary
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - sourceId
	 *               - targetId
	 *               - contextId
	 *               - documentId
	 *             properties:
	 *               sourceId:
	 *                 type: integer
	 *                 format: int64
	 *                 description: Dynamic id of source node.
	 *               targetId:
	 *                 type: integer
	 *                 format: int64
	 *                 description: Dynamic id of target node.
	 *               contextId:
	 *                 type: integer
	 *                 format: int64
	 *                 description: Dynamic id of context node.
	 *               documentId:
	 *                 type: integer
	 *                 format: int64
	 *                 description: Dynamic id of document node.
	 *     responses:
	 *       200:
	 *         description: Document moved successfully.
	 *       400:
	 *         description: Missing or invalid body values, or move refused (nodes outside the context...).
	 *       401:
	 *         description: One of the nodes is not accessible with this profile.
	 *       404:
	 *         description: sourceId, targetId, contextId or documentId not found.
	 *       500:
	 *         description: Internal server error.
	 */
	app.post("/api/v1/documentary/move_document_in_context", async (req, res, next) => {
		try {
			const profileId = getProfileId(req);
			let { sourceId, targetId, contextId, documentId } = req.body;
			if (!sourceId) return res.status(400).send({ message: "sourceId is required" });
			if (!targetId) return res.status(400).send({ message: "targetId is required" });
			if (!contextId) return res.status(400).send({ message: "contextId is required" });
			if (!documentId) return res.status(400).send({ message: "documentId is required" });

			const sourceNode = await loadNode("sourceId", sourceId, profileId);
			const targetNode = await loadNode("targetId", targetId, profileId);
			const contextNode = await loadNode("contextId", contextId, profileId);
			const documentNode = await loadNode("documentId", documentId, profileId);

			return serviceDocumentation
				.moveDocumentInContext(documentNode, sourceNode, targetNode, contextNode)
				.then(async (moved) => {
					const statusCode = moved ? 200 : 400;
					const response: any = { status: moved, message: moved ? "Document moved successfully" : "Failed to move document" };

					if (moved) {
						const node = documentNode instanceof SpinalDocument ? await documentNode.getNode() : documentNode;
						const documentInfo = node?.info.get() || {};
						response.data = { ...documentInfo, dynamicId: documentNode._server_id };
					}
					return res.status(statusCode).send(response);
				})
				.catch((error) => {
					return res.status(400).send({ message: error.message || "Failed to move document please check the provided IDs" });
				});
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});

	// Loads a node given in the body: 400 if the id is not a number, 404 if it does not exist.
	async function loadNode(field: string, value: any, profileId: string): Promise<SpinalNode> {
		const dynamicId = parseInt(value, 10);
		if (isNaN(dynamicId) || dynamicId <= 0) throw { code: 400, message: `Invalid ${field}` };

		const node = await spinalAPIMiddleware.load<SpinalNode>(dynamicId, profileId).catch((error: any) => {
			if (error?.code === 404) throw { code: 404, message: `${field} not found` };
			throw error;
		});
		if (!node) throw { code: 404, message: `${field} not found` };
		return node;
	}
};
