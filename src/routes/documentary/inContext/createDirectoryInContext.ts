import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalNode } from "spinal-env-viewer-graph-service";
import { waitUntilServerIdNotDefined } from "../utils";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
	 * @swagger
	 * /api/v1/documentary/create_directory/{contextId}/{parentId}:
	 *   post:
	 *     security:
	 *       - bearerAuth:
	 *           - write
	 *     summary: Create directory in context
	 *     description: Creates a documentation directory under a parent node within a context.
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
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - name
	 *             properties:
	 *               name:
	 *                 type: string
	 *                 description: Directory name.
	 *               icon:
	 *                 type: string
	 *                 description: Optional icon value for the directory.
	 *     responses:
	 *       200:
	 *         description: Directory created successfully.
	 *       400:
	 *         description: Missing or invalid parameters.
	 *       404:
	 *         description: Context or parent node not found.
	 *       500:
	 *         description: Internal server error.
	 */
	app.post("/api/v1/documentary/create_directory/:contextId/:parentId", async (req, res, next) => {
		try {
			const { name, icon } = req.body;
			if (!name) return res.status(400).send({ message: "Missing name in request body" });

			const profileId = getProfileId(req);
			const contextId = parseInt(req.params.contextId, 10);
			const parentId = parseInt(req.params.parentId, 10);

			if (isNaN(contextId)) return res.status(400).send({ message: "Invalid contextId parameter" });
			if (isNaN(parentId)) return res.status(400).send({ message: "Invalid parentId parameter" });

			const context = await spinalAPIMiddleware.load<SpinalNode>(contextId, profileId);
			if (!context) return res.status(404).send({ message: `Context with ID ${contextId} not found` });

			const parentNode = await spinalAPIMiddleware.load<SpinalNode>(parentId, profileId);
			if (!parentNode) return res.status(404).send({ message: `Parent node with ID ${parentId} not found` });

			const directory = await serviceDocumentation.addDirectoryToNodeInContext(parentNode, name, context, icon);

			await waitUntilServerIdNotDefined(directory);

			return res.status(200).send({
				...directory.info.get(),
				dynamicId: directory._server_id,
			});
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
