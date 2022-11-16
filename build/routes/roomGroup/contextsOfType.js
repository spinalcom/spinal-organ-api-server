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
const spinal_env_viewer_plugin_group_manager_service_1 = require("spinal-env-viewer-plugin-group-manager-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
  * @swagger
  * /api/v1/groupContext/contextsOfType/{type}:
  *   get:
  *     security:
  *       - OauthSecurity:
  *         - readOnly
  *     description: Return nodes of type in context
  *     summary: Gets a nodes of type with given ID context and Type
  *     tags:
  *      - Group Context
  *     parameters:
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
    app.get("/api/v1/groupContext/contextsOfType/:type", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        let nodes = [];
        try {
            var groupContexts = yield spinal_env_viewer_plugin_group_manager_service_1.default.getGroupContexts(req.params.type);
            for (let index = 0; index < groupContexts.length; index++) {
                const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(groupContexts[index].id);
                let info = {
                    dynamicId: realNode._server_id,
                    staticId: realNode.getId().get(),
                    name: realNode.getName().get(),
                    type: realNode.getType().get()
                };
                nodes.push(info);
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).send("ko");
        }
        res.json(nodes);
    }));
};
//# sourceMappingURL=contextsOfType.js.map