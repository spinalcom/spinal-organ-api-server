"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_analysis_1 = require("spinal-model-analysis");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/analysis/contexts/{contextId}:
     *   delete:
     *     security:
     *       - bearerAuth:
     *           - write
     *     summary: Delete an analysis context by its ID
     *     description: Deletes the analysis context and all its child analysis nodes.
     *     tags:
     *       - Analysis
     *     parameters:
     *       - in: path
     *         name: contextId
     *         required: true
     *         schema:
     *           type: string
     *           description: server_id of the analysis context to delete
     *     responses:
     *       200:
     *         description: Analysis context successfully deleted
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
    app.delete("/api/v1/analysis/contexts/:contextId", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const contextId = req.params.contextId;
            const contextNode = await spinalAPIMiddleware.load(parseInt(contextId, 10), profileId);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(contextNode);
            await spinal_model_analysis_1.spinalAnalyticNodeManagerService.deleteAnalysisContext(contextNode);
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
//# sourceMappingURL=deleteContext.js.map