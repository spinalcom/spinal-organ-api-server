"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const recTree_1 = require("../../utilities/recTree");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/context/{id}/tree/{numberOfLevel}/depth:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Get a context tree limited to a given depth
     *     description: >-
     *       Same traversal as `/api/v1/context/{id}/tree`, but stops after `numberOfLevel` levels of
     *       children. This is the route to use to browse a large context progressively, one level at a
     *       time.
     *     tags:
     *       - Contexts/ontologies
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the context.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: path
     *        name: numberOfLevel
     *        description: Number of levels of children to include below the context (1 returns the direct children only).
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: >-
     *           The context with its descendants down to the requested depth. When the requested node is
     *           not a SpinalContext the body is `null` with a 200 status.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/ContextTree'
     *       401:
     *         description: The profile is not allowed to read this context.
     *       500:
     *         description: The context could not be loaded or the tree could not be built.
     */
    app.get("/api/v1/context/:id/tree/:numberOfLevel/depth", async (req, res, next) => {
        let contexts;
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const context = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext) {
                contexts = {
                    dynamicId: context._server_id,
                    staticId: context.getId().get(),
                    name: context.getName().get(),
                    type: context.getType().get(),
                    context: (context instanceof spinal_env_viewer_graph_service_1.SpinalContext ? "SpinalContext" : ""),
                    children: await (0, recTree_1.recTreeDepth)(context, context, parseInt(req.params.numberOfLevel, 10))
                };
            }
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(contexts);
    });
};
//# sourceMappingURL=contextTreeDepth.js.map