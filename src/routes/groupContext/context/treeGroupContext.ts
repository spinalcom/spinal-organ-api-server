/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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

import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { ContextTree } from '../interfacesGroupContexts'
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { recTree } from '../../../utilities/recTree'

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/groupContext/{id}/tree:
 *   get:
 *     security: 
 *       - OauthSecurity: 
 *         - readOnly
 *     description: Return tree of context
 *     summary: Get a tree context by ID
 *     tags:
 *      - Group Context
 *     parameters:
 *      - in: path
 *        name: id
 *        description: use the dynamic ID
 *        required: true
 *        schema:
 *          type: integer
 *          format: int64
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

  app.get("/api/v1/groupContext/:id/tree", async (req, res, next) => {
    var contexts: ContextTree;

    try {
      var context = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      if (context instanceof SpinalContext) {
        contexts = {
          dynamicId: context._server_id,
          staticId: context.getId().get(),
          name: context.getName().get(),
          type: context.getType().get(),
          context: (context instanceof SpinalContext ? "SpinalContext" : ""),
          children: await recTree(context, context)
        };
      }
    } catch (error) {
      console.error(error);
      res.status(400).send("ko");
    }
    res.json(contexts);
  });
};
