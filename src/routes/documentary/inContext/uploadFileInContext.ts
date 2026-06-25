import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { FILE_NODE_TYPE, serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalNode } from "spinal-env-viewer-graph-service";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
	 * @swagger
	 * /api/v1/documentary/upload_file_in_context/{contextId}/{parentId}:
	 *   post:
	 *     security:
	 *       - bearerAuth:
	 *           - write
	 *     summary: Upload file in context
	 *     description: Uploads one or multiple files and attaches them under a parent node in a context.
	 *     tags:
	 *       - Documentary
	 *     parameters:
	 *       - in: path
	 *         name: contextId
	 *         required: true
	 *         description: Dynamic id of the context node.
	 *         schema:
	 *           type: integer
	 *           format: int64
	 *       - in: path
	 *         name: parentId
	 *         required: true
	 *         description: Dynamic id of the parent node.
	 *         schema:
	 *           type: integer
	 *           format: int64
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         multipart/form-data:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - file
	 *             properties:
	 *               file:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                   format: binary
	 *     responses:
	 *       200:
	 *         description: Files uploaded successfully.
	 *       400:
	 *         description: Invalid request or missing file.
	 *       404:
	 *         description: Context or parent node not found.
	 *       500:
	 *         description: Internal server error.
	 */
	app.post("/api/v1/documentary/upload_file_in_context/:contextId/:parentId", async (req, res, next) => {
		try {
			if (!req.files || !req.files.file) return res.status(400).send({ message: "No file uploaded" });

			const profileId = getProfileId(req);
			const contextId = parseInt(req.params.contextId, 10);
			const parentId = parseInt(req.params.parentId, 10);

			if (isNaN(contextId)) return res.status(400).send({ message: "Invalid contextId" });
			if (isNaN(parentId)) return res.status(400).send({ message: "Invalid parentId" });

			const context = await spinalAPIMiddleware.load<SpinalNode>(contextId, profileId);
			if (!context) return res.status(404).send({ message: `No context found with id ${contextId}` });

			const parent = await spinalAPIMiddleware.load<SpinalNode>(parentId, profileId);
			if (!parent) return res.status(404).send({ message: `No parent found with id ${parentId}` });

			let files = req.files.file;
			if (!Array.isArray(files)) files = [files];

			const fileUploaded = await serviceDocumentation.addFileToNodeInContext(parent, files, context);

			const filesFormatted = fileUploaded.map((fileNode) => ({
				...fileNode.info.get(),
				dynamicId: fileNode._server_id,
			}));

			return res.status(200).send(filesFormatted);
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
