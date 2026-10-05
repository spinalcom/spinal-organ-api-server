"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/context/{id}/nodesOfType/{type}:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the nodes of a given type in a context
     *     description: >-
     *       Browses the context, classifies its nodes by type and returns the ones matching `type`.
     *       The accepted values are exactly the ones returned by `/api/v1/context/{id}/nodeTypeList`;
     *       the comparison is case sensitive.
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
     *        name: type
     *        description: Node type to filter on, as returned by `/api/v1/context/{id}/nodeTypeList`.
     *        required: true
     *        schema:
     *          type: string
     *     responses:
     *       200:
     *         description: The nodes of the requested type found in the context.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/ContextNodeofTypes'
     *       400:
     *         description: No node of this type exists in the context ("type not found in context").
     *       401:
     *         description: The profile is not allowed to read this context.
     *       500:
     *         description: The context could not be loaded or browsed.
     */
    app.get("/api/v1/context/:id/nodesOfType/:type", async (req, res, next) => {
        const nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const context = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            const SpinalContextId = context.getId().get();
            const type_list = await spinal_env_viewer_graph_service_1.SpinalGraphService.browseAndClassifyByTypeInContext(SpinalContextId, SpinalContextId);
            const model_list = type_list.data[req.params.type];
            if (model_list === undefined) {
                res.status(400).send("type not found in context");
            }
            else {
                for (let index = 0; index < model_list.length; index++) {
                    // hacky way use realnode when fiexd
                    const realNode = model_list[index]._parents[0];
                    const info = {
                        dynamicId: realNode._server_id,
                        staticId: model_list[index].id.get(),
                        name: model_list[index].name.get(),
                        type: model_list[index].type.get()
                    };
                    nodes.push(info);
                }
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(nodes);
    });
};
//# sourceMappingURL=contextNodesOfType.js.map