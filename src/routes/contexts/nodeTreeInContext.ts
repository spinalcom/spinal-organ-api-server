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
import {
  SpinalContext,
  SpinalGraphService,
  SpinalNode,
} from 'spinal-env-viewer-graph-service';
import { ContextTree } from './interfacesContexts';
import { recTree } from '../../utilities/recTree';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/context/{idContext}/node/{idNode}/tree:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Return tree of node in context
   *     summary: Get a tree of node context with given IDcontext and IDnode
   *     tags:
   *       - Contexts/ontologies
   *     parameters:
   *      - in: path
   *        name: idContext
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: idNode
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

  app.get(
    '/api/v1/context/:idContext/node/:idNode/tree',
    async (req, res, next) => {
      let tree: ContextTree;

      try {
        var context = await spinalAPIMiddleware.load(
          parseInt(req.params.idContext, 10)
        );
        var node = await spinalAPIMiddleware.load(
          parseInt(req.params.idNode, 10)
        );
        // @ts-ignore
        SpinalGraphService._addNode(context);
        // @ts-ignore
        SpinalGraphService._addNode(node);

        if (
          context instanceof SpinalContext &&
          node instanceof SpinalNode &&
          node.belongsToContext(context)
        ) {
          tree = {
            dynamicId: node._server_id,
            staticId: node.getId().get(),
            name: node.getName().get(),
            type: node.getType().get(),
            children: await recTree(node, context),
          };
        } else {
          res.status(400).send('node not found in context');
        }
      } catch (error) {
        console.log(error);
        res.status(400).send('ko');
      }
      res.json(tree);
    }
  );
};
