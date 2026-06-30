"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_analysis_1 = require("spinal-model-analysis");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_model_graph_1 = require("spinal-model-graph");
function isSpinalNodeArray(value) {
    return Array.isArray(value) && value.length > 0 && value.every(v => v instanceof spinal_model_graph_1.SpinalNode);
}
function serializeNode(node) {
    return {
        id: node?.getId?.()?.get?.(),
        name: node?.getName?.()?.get?.(),
        type: node?.getType?.()?.get?.(),
        server_id: node?._server_id,
    };
}
function serializeValue(value) {
    if (value === null || value === undefined)
        return value;
    if (value instanceof spinal_model_graph_1.SpinalNode)
        return serializeNode(value);
    if (isSpinalNodeArray(value))
        return value.map(serializeNode);
    if (Array.isArray(value))
        return value.map(serializeValue);
    // spinal-core Model (Val / Str / Bool / SpinalBmsEndpoint / ...): registers can hold a
    // bindable model (e.g. ENDPOINT_NODE_CURRENT_VALUE_MODEL). Never emit the raw model — its
    // _parents form a cycle that breaks JSON.stringify. Expose its primitive value if it has
    // one, otherwise a safe descriptor of the model type.
    if (typeof value === 'object' && typeof value.get === 'function') {
        try {
            const got = value.get();
            const t = typeof got;
            if (got === null || t === 'string' || t === 'number' || t === 'boolean')
                return got;
        }
        catch {
            /* fall through to the descriptor */
        }
        return { _model: value.constructor?.name ?? 'Model' };
    }
    return value;
}
function serializeRecord(record) {
    if (!record)
        return record;
    const out = {};
    for (const key of Object.keys(record)) {
        out[key] = serializeValue(record[key]);
    }
    return out;
}
function serializeExecutionResult(result) {
    return {
        ...result,
        results: result.results.map(r => ({
            ...r,
            inputRegisters: serializeRecord(r.inputRegisters),
            executionOutputs: serializeRecord(r.executionOutputs),
        })),
    };
}
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
                data: serializeExecutionResult(result),
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