import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { spinalAnalyticNodeManagerService , VERSION, CONSTANTS } from "spinal-model-analysis";
import { awaitSync } from '../../../utilities/awaitSync';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

/**
 * @swagger
 * /api/v1/analysis/contexts:
 *   get:
 *     security:
 *       - bearerAuth:
 *           - readOnly
 *     summary: Get analysis contexts
 *     description: Retrieves analysis contexts, optionally filtered by name
 *     tags:
 *       - Analysis
 *     parameters:
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter contexts by name (partial match by default)
 *       - in: query
 *         name: exact
 *         required: false
 *         schema:
 *           type: boolean
 *         description: If true, matches context name exactly
 *     responses:
 *       200:
 *         description: Analysis contexts successfully retrieved
 *       400:
 *         description: Bad request
 */

  app.get("/api/v1/analysis/contexts", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const { name, exact } = req.query as {
      name?: string;
      exact?: string;
    };

      let contexts = spinalAnalyticNodeManagerService.getContexts();

      if (name) {
      const search = name.toLowerCase();
      const isExact = exact === 'true';

      contexts = contexts.filter(nodeInfo => {
        const node = SpinalGraphService.getRealNode(nodeInfo.id.get());
        const nodeName = node.getName().get().toLowerCase();

        return isExact
          ? nodeName === search
          : nodeName.includes(search);
      });
    }
      const data = contexts.map(nodeInfo => {
        const node = SpinalGraphService.getRealNode(nodeInfo.id.get());
        return {
          id: node._server_id,
          name: node.getName().get(),
          type: node.getType().get()
        }
      }
    );
      return res.json({
        data,
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
