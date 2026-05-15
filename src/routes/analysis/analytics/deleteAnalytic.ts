import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { spinalAnalyticNodeManagerService, VERSION } from "spinal-model-analysis";
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { SpinalNode } from 'spinal-model-graph';

module.exports = function (logger: any, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

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
      const profileId = getProfileId(req);
      const analyticId = req.params.analyticId;

      const analyticNode: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(analyticId, 10), profileId);
      SpinalGraphService._addNode(analyticNode);

      await spinalAnalyticNodeManagerService.deleteAnalysisNode(analyticNode);

      return res.json({
        data: { deleted: true },
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
