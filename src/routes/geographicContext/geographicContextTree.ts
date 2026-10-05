/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
// import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { ContextTree } from '../contexts/interfacesContexts'
import { recTree } from '../../utilities/recTree'
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/geographicContext/tree:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Get the whole geographic context tree
   *     description: >-
   *       Returns the **first** context of type `geographicContext` reachable by the profile, with all
   *       of its descendants : buildings, floors, rooms and everything hanging under them. A digital
   *       twin holding several geographic contexts will always be answered with the first one.
   *
   *
   *       The traversal has no depth limit, so on a real building this response is large and slow to
   *       build. Use `/api/v1/geographicContext/space` for the first three levels only, or
   *       `/api/v1/context/{id}/tree/{numberOfLevel}/depth` to walk a context step by step.
   *     tags:
   *       - Geographic Context
   *     responses:
   *       200:
   *         description: >-
   *           The geographic context and its descendants. When the twin has no geographic context the
   *           body is `null` with a 200 status.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/ContextTree'
   *       401:
   *         description: The profile is not allowed to read the graph.
   *       500:
   *         description: The profile graph or the context could not be read.
   */

  app.get("/api/v1/geographicContext/tree", async (req, res, next) => {
    let tree: ContextTree;
    try {
      const profileId = getProfileId(req);
      const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
      const temp_contexts = await userGraph.getChildren("hasContext");
      const geographicContexts = temp_contexts.filter(el => el.getType().get() === "geographicContext");
      const geographicContext = geographicContexts[0];

      if (geographicContext instanceof SpinalContext) {
        tree = {
          dynamicId: geographicContext._server_id,
          staticId: geographicContext.getId().get(),
          name: geographicContext.getName().get(),
          type: geographicContext.getType().get(),
          context: (geographicContext instanceof SpinalContext ? "SpinalContext" : ""),
          children: await recTree(geographicContext, geographicContext)
        };
      }
    } catch (error) {
      console.error(error);
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(tree);
  });
};
