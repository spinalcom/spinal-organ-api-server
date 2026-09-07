import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { spinalAnalysisFactoryService, spinalAnalyticNodeManagerService, VERSION, IAnalysisConfigJSON } from "spinal-model-analysis";
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { SpinalNode } from 'spinal-model-graph';
import { awaitSync } from '../../../utilities/awaitSync';

module.exports = function (logger: any, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/analysis/analytics/{analyticId}:
   *   put:
   *     security:
   *       - bearerAuth:
   *           - write
   *     summary: Update (full replace) a specific analytic by its ID
   *     description: >
   *       Updates an existing analytic in place from a JSON descriptor (IAnalysisConfigJSON shape).
   *       The analytic node keeps its id/server_id. Name, description, concurrency and status are
   *       updated directly on the node; the anchor link, the three workflows and the triggers are
   *       wiped and rebuilt from the body (workflow DAGs are rebuilt rather than diffed/patched).
   *       This is a FULL REPLACE: optional fields that are omitted revert to their defaults
   *       (concurrency -> BOUNDED/10, status -> Inactive, no anchor, no triggers). To preserve the
   *       current values, GET the analytic first and send it back with your changes applied.
   *       contextName is ignored (the analytic stays in its existing context). anchorNodeId is
   *       expected to be a numeric server_id and is converted to the internal SpinalNode id.
   *     tags:
   *       - Analysis
   *     parameters:
   *       - in: path
   *         name: analyticId
   *         required: true
   *         schema:
   *           type: string
   *           description: server_id of the analytic to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - analysisName
   *             properties:
   *               analysisName:
   *                 type: string
   *               description:
   *                 type: string
   *               anchorNodeId:
   *                 type: string
   *                 description: server_id of the node to use as the anchor target
   *               concurrency:
   *                 type: object
   *               status:
   *                 type: string
   *                 enum: [Active, Inactive]
   *               worknodeResolver:
   *                 type: object
   *               inputWorkflow:
   *                 type: object
   *               executionWorkflow:
   *                 type: object
   *               triggers:
   *                 type: array
   *                 items:
   *                   type: object
   *     responses:
   *       200:
   *         description: Analytic successfully updated (returns the updated details)
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

  app.put("/api/v1/analysis/analytics/:analyticId", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const analyticId = req.params.analyticId;
      const body = req.body as IAnalysisConfigJSON & { anchorNodeId?: string };

      const analyticNode: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(analyticId, 10), profileId);
      SpinalGraphService._addNode(analyticNode);

      // The analytic stays in its existing context — resolve it to satisfy validation.
      const contextNode: SpinalNode<any> = await spinalAnalyticNodeManagerService.getContextOfAnalytic(analyticNode);

      const config: IAnalysisConfigJSON = {
        ...body,
        contextName: contextNode.getName().get(),
      };

      // Convert anchor server_id ->  node id (same as create).
      if (body.anchorNodeId !== undefined && body.anchorNodeId !== null && `${body.anchorNodeId}` !== '') {
        const anchorNode: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(`${body.anchorNodeId}`, 10), profileId);
        SpinalGraphService._addNode(anchorNode);
        config.anchorNodeId = anchorNode.getId().get();
      } else {
        delete config.anchorNodeId;
      }

      const errors = spinalAnalysisFactoryService.validateConfig(config);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      await spinalAnalysisFactoryService.updateFromJSON(analyticNode, config);
      await awaitSync(analyticNode);

      const details = await spinalAnalyticNodeManagerService.getAnalyticDetails(analyticNode);
      return res.json({
        data: details,
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
