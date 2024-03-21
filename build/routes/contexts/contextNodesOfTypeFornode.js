"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/context/{contextId}/node/{nodeId}/nodesOfType/{type}:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: return the nodes of type from a node in a context
     *     summary: Get nodes of type from a node in a context with given IDcontext IDnode and type
     *     tags:
     *       - Contexts/ontologies
     *     parameters:
     *      - in: path
     *        name: contextId
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: path
     *        name: nodeId
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: path
     *        name: type
     *        required: true
     *        schema:
     *          type: string
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/ContextNodeofTypes'
     *       400:
     *         description: Bad request
     */
    app.get("/api/v1/context/:contextId/node/:nodeId/nodesOfType/:type", async (req, res, next) => {
        const nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const contextNode = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10), profileId);
            const SpinalContextNodeId = contextNode.getId().get();
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(contextNode);
            const SpinalNodeId = node.getId().get();
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            const type_list = await spinal_env_viewer_graph_service_1.SpinalGraphService.browseAndClassifyByTypeInContext(SpinalNodeId, SpinalContextNodeId);
            if (req.params.type in type_list.data) {
                const model_list = type_list.data[req.params.type];
                if (contextNode instanceof spinal_env_viewer_graph_service_1.SpinalContext && node.belongsToContext(contextNode)) {
                    for (let index = 0; index < model_list.length; index++) {
                        // hacky way use realnode when fiexd
                        const realNode = model_list[index]._parents[0];
                        // dynamicId: SpinalGraphService.getRealNode(model_list[index].id.get())._server_id,
                        const info = {
                            dynamicId: realNode._server_id,
                            staticId: model_list[index].id.get(),
                            name: model_list[index].name.get(),
                            type: model_list[index].type.get()
                        };
                        nodes.push(info);
                    }
                }
                else {
                    res.status(400).send("node not found in context");
                }
            }
            else {
                res.status(400).send("Type not found in node");
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
//# sourceMappingURL=contextNodesOfTypeFornode.js.map