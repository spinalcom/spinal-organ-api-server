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
     *     description: Creates new analytic associated with a specific analysis context node by its ID
     *     tags:
     *       - Analysis
     *     parameters:
     *       - in: path
     *         name: contextId
     *         required: true
     *         schema:
     *           type: string
     *           description: ID of the analysis context
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *
     *     responses:
     *       200:
     *         description: Analytic for the analysis context successfully created
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   description: Analytic information for the analysis context
     *                 meta:
     *                   type: object
     *                   properties:
     *                     analysisModuleVersion:
     *                       type: string
     *                       description: Version of spinal-model-analysis used
     *       400:
     *         description: Bad request
     */
    app.post("/api/v1/analysis/contexts/:contextId/analytics", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const contextId = req.params.contextId;
            const requestAnalyticDetails = req.body;
            const contextNode = await spinalAPIMiddleware.load(parseInt(contextId, 10), profileId);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(contextNode);
            const anchorNode = await spinalAPIMiddleware.load(parseInt(requestAnalyticDetails.anchor.id, 10), profileId);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(anchorNode);
            requestAnalyticDetails.anchor.id = anchorNode.getId().get();
            const analyticDetails = await spinal_model_analysis_1.spinalAnalyticNodeManagerService.createAnalytic(requestAnalyticDetails, contextNode);
            return res.json({
                data: analyticDetails,
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