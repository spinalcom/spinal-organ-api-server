import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { spinalAnalysisFactoryService, VERSION, IAnalysisConfigJSON } from "spinal-model-analysis";
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { SpinalNode } from 'spinal-model-graph';
import { awaitSync } from '../../../utilities/awaitSync';

module.exports = function (logger: any, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/analysis/contexts/{contextId}/analytics:
   *   post:
   *     security:
   *       - bearerAuth:
   *           - write
   *     summary: Create analytic for a specific analysis context
   *     description: Creates a new analysis (analytic) from a JSON descriptor under the given context. The body follows the IAnalysisConfigJSON shape from spinal-model-analysis. The contextName field is overridden by the context resolved from the URL. The anchorNodeId field is expected to be a numeric server_id and is converted to the internal SpinalNode id before being passed to the factory.
   *     tags:
   *       - Analysis
   *     parameters:
   *       - in: path
   *         name: contextId
   *         required: true
   *         schema:
   *           type: string
   *           description: server_id of the analysis context
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
   *               worknodeResolver:
   *                 type: object
   *               inputWorkflow:
   *                 type: object
   *               executionWorkflow:
   *                 type: object
   *     responses:
   *       200:
   *         description: Analytic successfully created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: number
   *                     name:
   *                       type: string
   *                     type:
   *                       type: string
   *                 meta:
   *                   type: object
   *                   properties:
   *                     analysisModuleVersion:
   *                       type: string
   *       400:
   *         description: Bad request
   */

  app.post("/api/v1/analysis/contexts/:contextId/analytics", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const contextId = req.params.contextId;
      const body = req.body as IAnalysisConfigJSON & { anchorNodeId?: string };

      const contextNode: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(contextId, 10), profileId);
      const graph = await spinalAPIMiddleware.getProfileGraph(profileId);

      const config: IAnalysisConfigJSON = {
        ...body,
        contextName: contextNode.getName().get(),
      };

      if (body.anchorNodeId !== undefined && body.anchorNodeId !== null && `${body.anchorNodeId}` !== '') {
        const anchorNode: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(`${body.anchorNodeId}`, 10), profileId);
        SpinalGraphService._addNode(anchorNode);
        config.anchorNodeId = anchorNode.getId().get();
      }

      const errors = spinalAnalysisFactoryService.validateConfig(config);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const analysisNode = await spinalAnalysisFactoryService.createFromJSON(config, graph);
      await awaitSync(analysisNode)
      return res.json({
        data: {
          id: analysisNode._server_id,
          name: analysisNode.getName().get(),
          type: analysisNode.getType().get(),
        },
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
