import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { spinalAnalyticNodeManagerService, VERSION, CONSTANTS } from "spinal-model-analysis";
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { SpinalNode } from 'spinal-model-graph';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/analysis/contexts/{contextId}/analytics:
   *   post:
   *     security:
   *       - bearerAuth:
   *           - write
   *     summary: Create analytic for a specific analysis context
   *     description: Creates new analytic associated with a specific analysis context node by its ID
   *     tags:
   *       - Analysis
   *     parameters:
   *       - in: path
   *         name: contextId
   *         required: true
   *         schema:
   *           type: string
   *           description: ID of the analysis context
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   * 
   *     responses:
   *       200:
   *         description: Analytic for the analysis context successfully created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   description: Analytic information for the analysis context
   *                 meta:
   *                   type: object
   *                   properties:
   *                     analysisModuleVersion:
   *                       type: string
   *                       description: Version of spinal-model-analysis used
   *       400:
   *         description: Bad request
   */

  app.post("/api/v1/analysis/contexts/:contextId/analytics", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const contextId = req.params.contextId;
      const requestAnalyticDetails = req.body;

      const contextNode: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(contextId, 10), profileId);
      SpinalGraphService._addNode(contextNode);

      const anchorNode: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(requestAnalyticDetails.anchor.id, 10), profileId);
      SpinalGraphService._addNode(anchorNode);

      requestAnalyticDetails.anchor.id = anchorNode.getId().get();

      const analyticDetails = await spinalAnalyticNodeManagerService.createAnalytic(
        requestAnalyticDetails,
        contextNode
      );

      return res.json({
        data: analyticDetails,
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
