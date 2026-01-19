"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_analysis_1 = require("spinal-model-analysis");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/analysis/contexts:
     *   get:
     *     security:
     *       - bearerAuth:
     *           - readOnly
     *     summary: Get analysis contexts
     *     description: Retrieves analysis contexts, optionally filtered by name
     *     tags:
     *       - Analysis
     *     parameters:
     *       - in: query
     *         name: name
     *         required: false
     *         schema:
     *           type: string
     *         description: Filter contexts by name (partial match by default)
     *       - in: query
     *         name: exact
     *         required: false
     *         schema:
     *           type: boolean
     *         description: If true, matches context name exactly
     *     responses:
     *       200:
     *         description: Analysis contexts successfully retrieved
     *       400:
     *         description: Bad request
     */
    app.get("/api/v1/analysis/contexts", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const { name, exact } = req.query;
            let contexts = spinal_model_analysis_1.spinalAnalyticNodeManagerService.getContexts();
            if (name) {
                const search = name.toLowerCase();
                const isExact = exact === 'true';
                contexts = contexts.filter(nodeInfo => {
                    const node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(nodeInfo.id.get());
                    const nodeName = node.getName().get().toLowerCase();
                    return isExact
                        ? nodeName === search
                        : nodeName.includes(search);
                });
            }
            const data = contexts.map(nodeInfo => {
                const node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(nodeInfo.id.get());
                return {
                    id: node._server_id,
                    name: node.getName().get(),
                    type: node.getType().get()
                };
            });
            return res.json({
                data,
                meta: {
                    analysisModuleVersion: spinal_model_analysis_1.VERSION
                }
            });
        }
        catch (error) {
            if (error?.code && error?.message) {
                return res.status(error.code).send(error.message);
            }
            if (error?.message) {
                return res.status(400).send(error.message);
            }
            console.error(error);
            return res.status(400).send(error);
        }
    });
};
//# sourceMappingURL=getContexts.js.map