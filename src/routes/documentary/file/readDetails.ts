import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { FILE_NODE_TYPE, SpinalDocument } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalNode } from "spinal-model-graph";
import { File as SpinalFile } from "spinal-core-connectorjs_type";
import { _formatFileNode, getContexts, getFileAttributes, getParents } from "../utils";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
	 * @swagger
	 * /api/v1/documentary/file/{fileId}/details:
	 *   get:
	 *     security:
	 *       - bearerAuth:
	 *           - readOnly
	 *     summary: Get file details
	 *     description: Returns basic details of a documentary file.
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
	 *     responses:
	 *       200:
	 *         description: File details returned successfully.
	 *       400:
	 *         description: Invalid file id.
	 *       404:
	 *         description: File not found.
	 *       500:
	 *         description: Internal server error.
	 */
	app.get("/api/v1/documentary/file/:fileId/details", async (req, res, next) => {
		try {
			const profileId = getProfileId(req);
			const fileId = parseInt(req.params.fileId, 10);

			if (isNaN(fileId)) return res.status(400).send({ message: "Invalid fileId" });

			let fileNode = await spinalAPIMiddleware.load<SpinalNode | SpinalDocument | SpinalFile>(fileId, profileId);
			if (!fileNode) return res.status(404).send({ message: `No file found with id ${fileId}` });

			if (fileNode instanceof SpinalDocument) fileNode = (await fileNode.getNode()) as SpinalNode;

			if (fileNode.getType().get() !== FILE_NODE_TYPE) return res.status(400).send({ message: `Node with id ${fileId} is not a file node` });

			const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
			const contexts = await getContexts(fileNode as SpinalNode, graph);

			const fileDetails = {
				...fileNode.info.get(),
				dynamicId: fileNode._server_id,
				attributes: await getFileAttributes(fileNode as SpinalNode),
				contexts: contexts.map((context) => ({ dynamicId: context._server_id, ...context.info.get() })),
				parents: await getParents(fileNode as SpinalNode, contexts),
			};

			return res.status(200).send(fileDetails);
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
