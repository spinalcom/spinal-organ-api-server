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
  * /api/v1/context/{id}/nodesOfType/{type}:
  *   get:
  *     security:
  *       - OauthSecurity:
  *         - readOnly
  *     description: Return nodes of type in context
  *     summary: Gets a nodes of type with given ID context and Type
  *     tags:
  *       - Contexts/ontologies
  *     parameters:
  *      - in: path
  *        name: id
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
    app.get("/api/v1/context/:id/nodesOfType/:type", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        let nodes = [];
        try {
            var context = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10));
            var SpinalContextId = context.getId().get();
            var type_list = yield spinal_env_viewer_graph_service_1.SpinalGraphService.browseAndClassifyByTypeInContext(SpinalContextId, SpinalContextId);
            var model_list = type_list.data[req.params.type];
            if (model_list === undefined) {
                res.status(400).send("type not found in context");
            }
            else {
                for (let index = 0; index < model_list.length; index++) {
                    // hacky way use realnode when fiexd
                    const realNode = model_list[index]._parents[0];
                    let info = {
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
            console.log(error);
            res.status(400).send("ko");
        }
        res.json(nodes);
    }));
};
//# sourceMappingURL=contextNodesOfType.js.map