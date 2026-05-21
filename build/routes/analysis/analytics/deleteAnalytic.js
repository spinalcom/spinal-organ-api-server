"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_analysis_1 = require("spinal-model-analysis");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/analysis/analytics/{analyticId}:
     *   delete:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Delete a specific analytic by its ID
     *     description: Deletes the analysis node identified by analyticId along with its mandatory sub-nodes (workflows, anchor, etc.).
     *     tags:
     *       - Analysis
     *     parameters:
     *       - in: path
     *         name: analyticId
     *         required: true
     *         schema:
     *           type: string
     *           description: server_id of the analytic to delete
     *     responses:
     *       200:
     *         description: Analytic successfully deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   properties:
     *                     deleted:
     *                       type: boolean
     *                 meta:
     *                   type: object
     *                   properties:
     *                     analysisModuleVersion:
     *                       type: string
     *       400:
     *         description: Bad request
     */
    app.delete("/api/v1/analysis/analytics/:analyticId", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const analyticId = req.params.analyticId;
            const analyticNode = await spinalAPIMiddleware.load(parseInt(analyticId, 10), profileId);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(analyticNode);
            await spinal_model_analysis_1.spinalAnalyticNodeManagerService.deleteAnalysisNode(analyticNode);
            return res.json({
                data: { deleted: true },
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
//# sourceMappingURL=deleteAnalytic.js.map