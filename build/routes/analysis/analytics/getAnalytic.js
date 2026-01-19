"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_analysis_1 = require("spinal-model-analysis");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/analysis/analytics/{analyticId}:
     *   get:
     *     security:
     *       - bearerAuth:
     *           - readOnly
     *     summary: Get a specific analytic by its ID
     *     description: Retrieves information about a specific analytic node by its ID
     *     tags:
     *       - Analysis
     *     parameters:
     *       - in: path
     *         name: analyticId
     *         required: true
     *         schema:
     *           type: string
     *           description: ID of the analytic to retrieve
     *     responses:
     *       200:
     *         description: Analytics for the analytic successfully retrieved
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   description: Analytics information for the analytic
     *                 meta:
     *                   type: object
     *                   properties:
     *                     analysisModuleVersion:
     *                       type: string
     *                       description: Version of spinal-model-analysis used
     *       400:
     *         description: Bad request
     */
    app.get("/api/v1/analysis/analytics/:analyticId", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const analyticId = req.params.analyticId;
            const analyticNode = await spinalAPIMiddleware.load(parseInt(analyticId, 10), profileId);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(analyticNode);
            const analyticDetails = await spinal_model_analysis_1.spinalAnalyticNodeManagerService.getAnalyticDetails(analyticNode.getId().get());
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
//# sourceMappingURL=getAnalytic.js.map