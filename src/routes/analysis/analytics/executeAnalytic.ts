import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { spinalAnalysisExecutionService, VERSION, serializeExecutionResult } from "spinal-model-analysis";
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { SpinalNode } from 'spinal-model-graph';

// Execution-result serialization now lives in spinal-model-analysis (serializeExecutionResult),
// so this route no longer needs to know how a block output (SpinalNode, spinal Model, Excel
// workbook handle, Buffer, …) turns into JSON — the module owns those shapes and keeps it correct.

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
