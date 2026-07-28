"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_analysis_1 = require("spinal-model-analysis");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const awaitSync_1 = require("../../../utilities/awaitSync");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/analysis/analytics/{analyticId}:
     *   patch:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Partially update an analytic's metadata (name / description / concurrency / status)
     *     description: >
     *       Updates only the metadata fields present in the body — analysisName, description,
     *       concurrency and/or status — leaving the workflows, anchor and triggers untouched.
     *       Use the PUT route for a full replace (which rebuilds the workflows). Unlike PUT, this
     *       does not bump the analysis revision: none of these fields require the organ to rebuild
     *       triggers/bindings (status is handled by the active-gate, concurrency is read per run).
     *       Any other fields in the body (workflows, anchor, triggers) are ignored.
     *     tags:
     *       - Analysis
     *     parameters:
     *       - in: path
     *         name: analyticId
     *         required: true
     *         schema:
     *           type: string
     *           description: server_id of the analytic to patch
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               analysisName:
     *                 type: string
     *               description:
     *                 type: string
     *               concurrency:
     *                 type: object
     *               status:
     *                 type: string
     *                 enum: [Active, Inactive]
     *     responses:
     *       200:
     *         description: Analytic successfully patched (returns the updated details)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   description: The updated analytic config (IAnalysisConfigJSON)
     *                 meta:
     *                   type: object
     *                   properties:
     *                     analysisModuleVersion:
     *                       type: string
     *       400:
     *         description: Bad request
     */
    app.patch("/api/v1/analysis/analytics/:analyticId", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const analyticId = req.params.analyticId;
            const body = (req.body ?? {});
            const analyticNode = await spinalAPIMiddleware.load(parseInt(analyticId, 10), profileId);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(analyticNode);
            // Only the metadata fields are patchable here; everything else is ignored.
            const patch = {};
            if (body.analysisName !== undefined)
                patch.analysisName = body.analysisName;
            if (body.description !== undefined)
                patch.description = body.description;
            if (body.concurrency !== undefined)
                patch.concurrency = body.concurrency;
            if (body.status !== undefined)
                patch.status = body.status;
            await spinal_model_analysis_1.spinalAnalysisFactoryService.patchAnalysis(analyticNode, patch);
            await (0, awaitSync_1.awaitSync)(analyticNode);
            const details = await spinal_model_analysis_1.spinalAnalyticNodeManagerService.getAnalyticDetails(analyticNode);
            return res.json({
                data: details,
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
//# sourceMappingURL=patchAnalytic.js.map