import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { spinalAnalyticNodeManagerService, VERSION } from "spinal-model-analysis";
import { awaitSync } from '../../../utilities/awaitSync';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';

module.exports = function (logger: any, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/analysis/contexts:
   *   post:
   *     security:
   *       - bearerAuth:
   *           - write
   *     summary: Create an analysis context
   *     description: Creates a new analysis context node and returns its information
   *     tags:
   *       - Analysis
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - contextName
   *             properties:
   *               contextName:
   *                 type: string
   *                 description: Name of the analysis context to create
   *                 example: Energy Analysis
   *     responses:
   *       200:
   *         description: Analysis context successfully created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   description: Created analysis context node information
   *                 meta:
   *                   type: object
   *                   properties:
   *                     analysisModuleVersion:
   *                       type: string
   *                       description: Version of spinal-model-analysis used
   *       400:
   *         description: Bad request
   */

  app.post("/api/v1/analysis/contexts", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const contextName = req.body.contextName;
      const graph = await spinalAPIMiddleware.getProfileGraph(profileId);

      const node = await spinalAnalyticNodeManagerService.createContext(contextName, graph);
      await awaitSync(node)
      return res.json({
        data: {
          id: node._server_id,
          name: node.getName().get(),
          type: node.getType().get(),
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
