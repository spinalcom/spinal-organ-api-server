"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const recTree_1 = require("../../utilities/recTree");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/geographicContext/tree:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Get the whole geographic context tree
     *     description: >-
     *       Returns the **first** context of type `geographicContext` reachable by the profile, with all
     *       of its descendants : buildings, floors, rooms and everything hanging under them. A digital
     *       twin holding several geographic contexts will always be answered with the first one.
     *
     *
     *       The traversal has no depth limit, so on a real building this response is large and slow to
     *       build. Use `/api/v1/geographicContext/space` for the first three levels only, or
     *       `/api/v1/context/{id}/tree/{numberOfLevel}/depth` to walk a context step by step.
     *     tags:
     *       - Geographic Context
     *     responses:
     *       200:
     *         description: >-
     *           The geographic context and its descendants. When the twin has no geographic context the
     *           body is `null` with a 200 status.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/ContextTree'
     *       401:
     *         description: The profile is not allowed to read the graph.
     *       500:
     *         description: The profile graph or the context could not be read.
     */
    app.get("/api/v1/geographicContext/tree", async (req, res, next) => {
        let tree;
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const temp_contexts = await userGraph.getChildren("hasContext");
            const geographicContexts = temp_contexts.filter(el => el.getType().get() === "geographicContext");
            const geographicContext = geographicContexts[0];
            if (geographicContext instanceof spinal_env_viewer_graph_service_1.SpinalContext) {
                tree = {
                    dynamicId: geographicContext._server_id,
                    staticId: geographicContext.getId().get(),
                    name: geographicContext.getName().get(),
                    type: geographicContext.getType().get(),
                    context: (geographicContext instanceof spinal_env_viewer_graph_service_1.SpinalContext ? "SpinalContext" : ""),
                    children: await (0, recTree_1.recTree)(geographicContext, geographicContext)
                };
            }
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(tree);
    });
};
//# sourceMappingURL=geographicContextTree.js.map