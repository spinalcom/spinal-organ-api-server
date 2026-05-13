"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_analysis_1 = require("spinal-model-analysis");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/analysis/contexts/{contextId}/analytics:
     *   post:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Create analytic for a specific analysis context
     *     description: Creates a new analysis (analytic) from a JSON descriptor under the given context. The body follows the IAnalysisConfigJSON shape from spinal-model-analysis. The contextName field is overridden by the context resolved from the URL. The anchorNodeId field is expected to be a numeric server_id and is converted to the internal SpinalNode id before being passed to the factory.
     *     tags:
     *       - Analysis
     *     parameters:
     *       - in: path
     *         name: contextId
     *         required: true
     *         schema:
     *           type: string
     *           description: server_id of the analysis context
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - analysisName
     *             properties:
     *               analysisName:
     *                 type: string
     *               description:
     *                 type: string
     *               anchorNodeId:
     *                 type: string
     *                 description: server_id of the node to use as the anchor target
     *               worknodeResolver:
     *                 type: object
     *               inputWorkflow:
     *                 type: object
     *               executionWorkflow:
     *                 type: object
     *     responses:
     *       200:
     *         description: Analytic successfully created
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: number
     *                     name:
     *                       type: string
     *                     type:
     *                       type: string
     *                 meta:
     *                   type: object
     *                   properties:
     *                     analysisModuleVersion:
     *                       type: string
     *       400:
     *         description: Bad request
     */
    app.post("/api/v1/analysis/contexts/:contextId/analytics", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const contextId = req.params.contextId;
            const body = req.body;
            const contextNode = await spinalAPIMiddleware.load(parseInt(contextId, 10), profileId);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(contextNode);
            const config = {
                ...body,
                contextName: contextNode.getName().get(),
            };
            if (body.anchorNodeId !== undefined && body.anchorNodeId !== null && `${body.anchorNodeId}` !== '') {
                const anchorNode = await spinalAPIMiddleware.load(parseInt(`${body.anchorNodeId}`, 10), profileId);
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(anchorNode);
                config.anchorNodeId = anchorNode.getId().get();
            }
            const analysisNode = await spinal_model_analysis_1.spinalAnalysisFactoryService.createFromJSON(config);
            return res.json({
                data: {
                    id: analysisNode._server_id,
                    name: analysisNode.getName().get(),
                    type: analysisNode.getType().get(),
                },
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
//# sourceMappingURL=createAnalytics.js.map