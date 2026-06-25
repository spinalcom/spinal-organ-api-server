import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { SpinalContext, SpinalGraphService } from "spinal-env-viewer-graph-service";
import { getProfileId } from "../../../utilities/requestUtilities";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
	 * @swagger
	 * /api/v1/documentary/create_context:
	 *   post:
	 *     security:
	 *       - bearerAuth:
	 *           - write
	 *     summary: Create documentary context
	 *     description: Creates a documentary context and links it to the user graph when needed.
	 *     tags:
	 *       - Documentary
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
	 *                 description: Name of the context to create.
	 *     responses:
	 *       200:
	 *         description: Context created successfully.
	 *       400:
	 *         description: Missing or invalid request data.
	 *       406:
	 *         description: Profile graph not found.
	 *       500:
	 *         description: Internal server error.
	 */
	app.post("/api/v1/documentary/create_context", async (req, res, next) => {
		try {
			const { name } = req.body;
			if (!name) return res.status(400).send({ message: "Missing name in request body" });

			const graph = await spinalAPIMiddleware.getGraph();
			await SpinalGraphService.setGraph(graph);

			const profileId = getProfileId(req);
			const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);

			if (!userGraph) return res.status(406).send({ message: `No graph found for ${profileId}` });

			const context = await serviceDocumentation.createDocumentaryContext(graph, name);
			if (context instanceof SpinalContext && graph._server_id !== userGraph._server_id) {
				await userGraph.addContext(context);
			}

			const contextFormatted = {
				...context.info.get(),
				dynamicId: context._server_id,
			};

			return res.status(200).send(contextFormatted);
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
