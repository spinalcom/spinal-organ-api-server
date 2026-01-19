import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { spinalAnalyticNodeManagerService , VERSION, CONSTANTS } from "spinal-model-analysis";
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { SpinalNode } from 'spinal-model-graph';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

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
      const profileId = getProfileId(req);
      const analyticId = req.params.analyticId;

      const analyticNode: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(analyticId, 10),profileId);
      SpinalGraphService._addNode(analyticNode);
      const analyticDetails = await spinalAnalyticNodeManagerService.getAnalyticDetails(analyticNode.getId().get());
      return res.json({
        data: analyticDetails,
        meta: {
          analysisModuleVersion : VERSION
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
