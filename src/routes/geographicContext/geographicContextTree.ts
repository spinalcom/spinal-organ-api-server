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
import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { ContextTree } from '../contexts/interfacesContexts'
import { recTree } from '../../utilities/recTree'
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {

  /**
 * @swagger
 * /api/v1/geographicContext/tree:
 *   get:
 *     security: 
 *       - OauthSecurity: 
 *         - readOnly
 *     description: Return the geographic context
 *     summary: Get the geographic context
 *     tags:
 *       - Geographic Context
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema: 
 *                $ref: '#/components/schemas/ContextTree'
 *       400:
 *         description: Bad request
 */

  app.get("/api/v1/geographicContext/tree", async (req, res, next) => {
    var tree: ContextTree;
    try {
      let geographicContexts = await SpinalGraphService.getContextWithType("geographicContext");
      let geographicContext = geographicContexts[0];

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
      res.status(400).send("ko");
    }
    res.json(tree);
  });
};
