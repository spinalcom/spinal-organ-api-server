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
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/geographicContext/tree:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Return the geographic context
   *     summary: Get the geographic context
   *     tags:
   *       - Geographic Context
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
    app.get("/api/v1/geographicContext/tree", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var tree;
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = yield spinalAPIMiddleware.getProfileGraph(profileId);
            const temp_contexts = yield userGraph.getChildren("hasContext");
            let geographicContexts = temp_contexts.filter(el => el.getType().get() === "geographicContext");
            let geographicContext = geographicContexts[0];
            if (geographicContext instanceof spinal_env_viewer_graph_service_1.SpinalContext) {
                tree = {
                    dynamicId: geographicContext._server_id,
                    staticId: geographicContext.getId().get(),
                    name: geographicContext.getName().get(),
                    type: geographicContext.getType().get(),
                    context: (geographicContext instanceof spinal_env_viewer_graph_service_1.SpinalContext ? "SpinalContext" : ""),
                    children: yield (0, recTree_1.recTree)(geographicContext, geographicContext)
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
    }));
};
//# sourceMappingURL=geographicContextTree.js.map