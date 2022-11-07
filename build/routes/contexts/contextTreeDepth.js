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
const recTree_1 = require("../../utilities/recTree");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/context/{id}/tree/{numberOfLevel}/depth:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Return tree of context
   *     summary: Get a tree context by ID
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
   *        name: numberOfLevel
   *        description: the number of levels to go
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/ContextTree'
   *       400:
   *         description: Bad request
   */
    app.get("/api/v1/context/:id/tree/:numberOfLevel/depth", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var contexts;
        try {
            var context = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10));
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext) {
                contexts = {
                    dynamicId: context._server_id,
                    staticId: context.getId().get(),
                    name: context.getName().get(),
                    type: context.getType().get(),
                    context: (context instanceof spinal_env_viewer_graph_service_1.SpinalContext ? "SpinalContext" : ""),
                    children: yield (0, recTree_1.recTreeDepth)(context, context, parseInt(req.params.numberOfLevel, 10))
                };
            }
        }
        catch (error) {
            console.error(error);
            res.status(400).send("ko");
        }
        res.json(contexts);
    }));
};
//# sourceMappingURL=contextTreeDepth.js.map