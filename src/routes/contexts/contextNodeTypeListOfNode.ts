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

import spinalAPIMiddleware from '../../app/spinalAPIMiddleware';
import * as express from 'express';
import {
  SpinalContext,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/context/{idContext}/node/{idNode}/nodeTypeList:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Return node type list of context
   *     summary: Get type list from node in context with given IDcontext ans IDnode
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
   *              $ref: "#/components/schemas/ContextNodeTypeList"
   *       400:
   *         description: Bad request
   */

  app.get(
    '/api/v1/context/:contextId/node/:nodeId/nodeTypeList',
    async (req, res, next) => {
      var type_list;
      try {
        var contextNode = await spinalAPIMiddleware.load(
          parseInt(req.params.contextId, 10)
        );
        // @ts-ignore
        SpinalGraphService._addNode(contextNode);
        var SpinalContextNodeId = contextNode.getId().get();
        var node = await spinalAPIMiddleware.load(
          parseInt(req.params.nodeId, 10)
        );
        // @ts-ignore
        SpinalGraphService._addNode(node);
        var SpinalNodeId = node.getId().get();

        if (
          contextNode instanceof SpinalContext &&
          node.belongsToContext(contextNode)
        ) {
          type_list = await SpinalGraphService.browseAndClassifyByTypeInContext(
            SpinalNodeId,
            SpinalContextNodeId
          );
        } else {
          res.status(400).send('node not found in context');
        }
      } catch (error) {
        console.log(error);
        res.status(400).send('ko');
      }
      res.json(type_list.types);
    }
  );
};
