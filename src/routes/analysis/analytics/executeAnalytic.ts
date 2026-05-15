import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { spinalAnalysisExecutionService, VERSION, AnalysisExecutionResult } from "spinal-model-analysis";
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { SpinalNode } from 'spinal-model-graph';

function isSpinalNodeArray(value: unknown): value is SpinalNode<any>[] {
  return Array.isArray(value) && value.length > 0 && value.every(v => v instanceof SpinalNode);
}

function serializeNode(node: SpinalNode<any>) {
  return {
    id: node?.getId?.()?.get?.(),
    name: node?.getName?.()?.get?.(),
    type: node?.getType?.()?.get?.(),
    server_id: (node as any)?._server_id,
  };
}

function serializeValue(value: unknown): unknown {
  if (value instanceof SpinalNode) return serializeNode(value);
  if (isSpinalNodeArray(value)) return value.map(serializeNode);
  return value;
}

function serializeRecord(record: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!record) return record;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(record)) {
    out[key] = serializeValue(record[key]);
  }
  return out;
}

function serializeExecutionResult(result: AnalysisExecutionResult) {
  return {
    ...result,
    results: result.results.map(r => ({
      ...r,
      inputRegisters: serializeRecord(r.inputRegisters),
      executionOutputs: serializeRecord(r.executionOutputs),
    })),
  };
}

module.exports = function (logger: any, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

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
      const profileId = getProfileId(req);
      const analyticId = req.params.analyticId;

      const analysisNode: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(analyticId, 10), profileId);
      SpinalGraphService._addNode(analysisNode);

      const result = await spinalAnalysisExecutionService.executeAnalysis(analysisNode);

      return res.json({
        data: serializeExecutionResult(result),
        meta: {
          analysisModuleVersion: VERSION
        }
      });

    } catch (error: any) {
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
}
