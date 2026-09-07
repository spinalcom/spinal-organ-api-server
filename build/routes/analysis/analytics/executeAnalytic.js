"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_analysis_1 = require("spinal-model-analysis");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
// Execution-result serialization now lives in spinal-model-analysis (serializeExecutionResult),
// so this route no longer needs to know how a block output (SpinalNode, spinal Model, Excel
// workbook handle, Buffer, …) turns into JSON — the module owns those shapes and keeps it correct.
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/analysis/analytics/{analyticId}/execute:
     *   post:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Execute a specific analytic by its ID
     *     description: Runs the full analysis pipeline (worknode resolver → input workflow → execution workflow) for the given analytic and returns the per-work-node execution results.
     *     tags:
     *       - Analysis
     *     parameters:
     *       - in: path
     *         name: analyticId
     *         required: true
     *         schema:
     *           type: string
     *           description: server_id of the analytic to execute
     *     responses:
     *       200:
     *         description: Analytic successfully executed
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   properties:
     *                     analysisName:
     *                       type: string
     *                     totalWorkNodes:
     *                       type: integer
     *                     results:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           workNodeId:
     *                             type: string
     *                           workNodeName:
     *                             type: string
     *                           success:
     *                             type: boolean
     *                           inputRegisters:
     *                             type: object
     *                           executionOutputs:
     *                             type: object
     *                           error:
     *                             type: string
     *                 meta:
     *                   type: object
     *                   properties:
     *                     analysisModuleVersion:
     *                       type: string
     *       400:
     *         description: Bad request
     */
    app.post("/api/v1/analysis/analytics/:analyticId/execute", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const analyticId = req.params.analyticId;
            const analysisNode = await spinalAPIMiddleware.load(parseInt(analyticId, 10), profileId);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(analysisNode);
            const result = await spinal_model_analysis_1.spinalAnalysisExecutionService.executeAnalysis(analysisNode);
            return res.json({
                data: (0, spinal_model_analysis_1.serializeExecutionResult)(result),
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
//# sourceMappingURL=executeAnalytic.js.map