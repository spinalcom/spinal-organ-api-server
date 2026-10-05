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
import { ContextTree } from './interfacesContexts'
import { recTreeDepth } from '../../utilities/recTree'
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/context/{id}/tree/{numberOfLevel}/depth:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Get a context tree limited to a given depth
   *     description: >-
   *       Same traversal as `/api/v1/context/{id}/tree`, but stops after `numberOfLevel` levels of
   *       children. This is the route to use to browse a large context progressively, one level at a
   *       time.
   *     tags:
   *       - Contexts/ontologies
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the context.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: numberOfLevel
   *        description: Number of levels of children to include below the context (1 returns the direct children only).
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: >-
   *           The context with its descendants down to the requested depth. When the requested node is
   *           not a SpinalContext the body is `null` with a 200 status.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/ContextTree'
   *       401:
   *         description: The profile is not allowed to read this context.
   *       500:
   *         description: The context could not be loaded or the tree could not be built.
   */

  app.get("/api/v1/context/:id/tree/:numberOfLevel/depth", async (req, res, next) => {
    let contexts: ContextTree;
    try {
      const profileId = getProfileId(req);
      const context = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      if (context instanceof SpinalContext) {
        contexts = {
          dynamicId: context._server_id,
          staticId: context.getId().get(),
          name: context.getName().get(),
          type: context.getType().get(),
          context: (context instanceof SpinalContext ? "SpinalContext" : ""),
          children: await recTreeDepth(context, context, parseInt(req.params.numberOfLevel, 10))
        };
      }
    } catch (error) {
      console.error(error);
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(contexts);
  });
};

