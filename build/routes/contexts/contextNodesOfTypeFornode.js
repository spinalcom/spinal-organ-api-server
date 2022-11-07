"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/context/{contextId}/node/{nodeId}/nodesOfType/{type}:
     *   get:
     *     security:
     *       - OauthSecurity:
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
    app.get('/api/v1/context/:contextId/node/:nodeId/nodesOfType/:type', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        let nodes = [];
        try {
            yield spinalAPIMiddleware.getGraph();
            var contextNode = yield spinalAPIMiddleware.load(parseInt(req.params.contextId, 10));
            var node = yield spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10));
            var SpinalContextNodeId = contextNode.getId().get();
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(contextNode);
            var SpinalNodeId = node.getId().get();
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            var type_list = yield spinal_env_viewer_graph_service_1.SpinalGraphService.browseAndClassifyByTypeInContext(SpinalNodeId, SpinalContextNodeId);
            if (req.params.type in type_list.data) {
                let model_list = type_list.data[req.params.type];
                if (contextNode instanceof spinal_env_viewer_graph_service_1.SpinalContext &&
                    node.belongsToContext(contextNode)) {
                    for (let index = 0; index < model_list.length; index++) {
                        // hacky way use realnode when fiexd
                        const realNode = model_list[index]._parents[0];
                        // dynamicId: SpinalGraphService.getRealNode(model_list[index].id.get())._server_id,
                        let info = {
                            dynamicId: realNode._server_id,
                            staticId: model_list[index].id.get(),
                            name: model_list[index].name.get(),
                            type: model_list[index].type.get(),
                        };
                        nodes.push(info);
                    }
                }
                else {
                    res.status(400).send('node not found in context');
                }
            }
            else {
                res.status(400).send('Type not found in node');
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).send('ko');
        }
        res.json(nodes);
    }));
};
//# sourceMappingURL=contextNodesOfTypeFornode.js.map