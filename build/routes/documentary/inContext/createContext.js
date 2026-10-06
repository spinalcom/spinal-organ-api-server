"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const utils_1 = require("../utils");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/create_context:
     *   post:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Create documentary context
     *     description: >
     *       Creates a documentary context and links it to the user graph when needed. Context creations are
     *       serialized (in memory) so that two simultaneous requests cannot create two contexts with the same name.
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
     *         description: Missing or invalid request data, or a context with this name already exists.
     *       406:
     *         description: Profile graph not found.
     *       500:
     *         description: Internal server error.
     *       503:
     *         description: The hub did not confirm the creation in time (the context may still appear later).
     */
    app.post("/api/v1/documentary/create_context", async (req, res, next) => {
        try {
            const { name } = req.body;
            if (!name)
                return res.status(400).send({ message: "Missing name in request body" });
            const graph = await spinalAPIMiddleware.getGraph();
            await spinal_env_viewer_graph_service_1.SpinalGraphService.setGraph(graph);
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            if (!userGraph)
                return res.status(406).send({ message: `No graph found for ${profileId}` });
            // The existence check and the creation must not interleave with another creation.
            const context = await (0, utils_1.runExclusive)("documentary-create-context", async () => {
                const contextAlreadyExist = await graph.getContext(name);
                if (contextAlreadyExist)
                    throw { code: 400, message: `Context with name ${name} already exists` };
                const created = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.createDocumentaryContext(graph, name);
                if (created instanceof spinal_env_viewer_graph_service_1.SpinalContext && graph._server_id !== userGraph._server_id) {
                    await userGraph.addContext(created);
                }
                return created;
            });
            await (0, utils_1.waitUntilServerIdNotDefined)(context);
            const contextFormatted = {
                ...context.info.get(),
                dynamicId: context._server_id,
            };
            return res.status(200).send(contextFormatted);
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(500).send({ message: error.message });
        }
    });
};
//# sourceMappingURL=createContext.js.map