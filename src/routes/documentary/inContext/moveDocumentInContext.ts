import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
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
	 *         description: Missing or invalid body values.
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

			const sourceNode = await spinalAPIMiddleware.load<SpinalNode>(parseInt(sourceId, 10), profileId);
			const targetNode = await spinalAPIMiddleware.load<SpinalNode>(parseInt(targetId, 10), profileId);
			const contextNode = await spinalAPIMiddleware.load<SpinalNode>(parseInt(contextId, 10), profileId);
			const documentNode = await spinalAPIMiddleware.load<SpinalNode>(parseInt(documentId, 10), profileId);

			if (!sourceNode) return res.status(400).send({ message: "sourceId not found" });
			if (!targetNode) return res.status(400).send({ message: "targetId not found" });
			if (!contextNode) return res.status(400).send({ message: "contextId not found" });
			if (!documentNode) return res.status(400).send({ message: "documentId not found" });

			await serviceDocumentation.moveDocumentInContext(documentNode, sourceNode, targetNode, contextNode);
			return res.status(200).send({ status: true, message: "Document moved successfully", data: { ...documentNode.info.get(), dynamicId: documentNode._server_id } });
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
