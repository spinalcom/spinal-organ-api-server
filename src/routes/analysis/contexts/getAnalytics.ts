import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { spinalAnalyticNodeManagerService , VERSION, CONSTANTS } from "spinal-model-analysis";
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { SpinalNode } from 'spinal-model-graph';
import { count } from 'console';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

/**
 * @swagger
 * /api/v1/analysis/contexts/{contextId}/analytics:
 *   get:
 *     security:
 *       - bearerAuth:
 *           - readOnly
 *     summary: Get analytics for a specific analysis context
 *     description: Retrieves information about all analytics associated with a specific analysis context node by its ID
 *     tags:
 *       - Analysis
 *     parameters:
 *       - in: path
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *           description: ID of the analysis context
 *     responses:
 *       200:
 *         description: Analytics for the analysis context successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   description: Analytics information for the analysis context
 *                 meta:
 *                   type: object
 *                   properties:
 *                     analysisModuleVersion:
 *                       type: string
 *                       description: Version of spinal-model-analysis used
 *       400:
 *         description: Bad request
 */

  app.get("/api/v1/analysis/contexts/:contextId/analytics", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const contextId = req.params.contextId;

      const contextNode: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(contextId, 10),profileId);
      SpinalGraphService._addNode(contextNode);
      const analytics = await spinalAnalyticNodeManagerService.getAllAnalytics(contextNode.getId().get());
      const analyticDetails = [];
      for ( const analyticInfo of analytics ){

        // Config node
        const analyticConfig = await spinalAnalyticNodeManagerService.getConfig(analyticInfo.id.get()); 
        const analyticNode = SpinalGraphService.getRealNode(analyticInfo.id.get());
        const analyticConfigAttributes = await spinalAnalyticNodeManagerService.getAllCategoriesAndAttributesFromNode(analyticConfig.id.get());

        // Tracking method node 
        const analyticTrackingMethodInfo = await spinalAnalyticNodeManagerService.getTrackingMethod(analyticInfo.id.get());

        // Anchor node 
        const analyticAnchorInfo = await spinalAnalyticNodeManagerService.getFollowedEntity(analyticInfo.id.get());
        const analyticAnchorNode = SpinalGraphService.getRealNode(analyticAnchorInfo.id.get());
        const inputAttributes = await spinalAnalyticNodeManagerService.getAllCategoriesAndAttributesFromNode(analyticTrackingMethodInfo.id.get());
        

        analyticDetails.push({
          id: analyticNode._server_id,
          name: analyticNode.getName().get(),
          type: analyticNode.getType().get(),
          config: analyticConfigAttributes,
          inputs : inputAttributes,
          anchor: {
            id: analyticAnchorNode._server_id,
            name: analyticAnchorNode.getName().get(),
            type: analyticAnchorNode.getType().get()
          }
        });
        }

      return res.json({
        data: analyticDetails,
        meta: {
          count : analyticDetails.length,
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
