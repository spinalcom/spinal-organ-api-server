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
import groupManagerService from 'spinal-env-viewer-plugin-group-manager-service';
import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/endPointsGroup/{contextId}/category/{categoryId}/group/{groupId}/endpointList:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: read  endpointList
   *     summary: Get  endpointList
   *     tags:
   *       - EndPoints Group
   *     parameters:
   *      - in: path
   *        name: contextId
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: categoryId
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: groupId
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
   *                $ref: '#/components/schemas/BasicNode'
   *       400:
   *         description: Bad request
   */

  app.get(
    '/api/v1/endPointsGroup/:contextId/category/:categoryId/group/:groupId/endpointList',
    async (req, res, next) => {
      try {
        var _endpointList = [];
        var context: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.contextId, 10)
        );
        //@ts-ignore
        SpinalGraphService._addNode(context);

        var category: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.categoryId, 10)
        );
        //@ts-ignore
        SpinalGraphService._addNode(category);

        var group: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.groupId, 10)
        );
        //@ts-ignore
        SpinalGraphService._addNode(group);

        if (
          context instanceof SpinalContext &&
          category.belongsToContext(context) &&
          group.belongsToContext(context)
        ) {
          if (context.getType().get() === 'BmsEndpointGroupContext') {
            const endpointList = await group.getChildren('groupHasBmsEndpoint');
            for (const endpoint of endpointList) {
              var info = {
                dynamicId: endpoint._server_id,
                staticId: endpoint.getId().get(),
                name: endpoint.getName().get(),
                type: endpoint.getType().get(),
              };
              _endpointList.push(info);
            }
          } else {
            res
              .status(400)
              .send('node is not type of BmsEndpointGroupContext ');
          }
        } else {
          res.status(400).send('category or group not found in context');
        }
      } catch (error) {
        console.log(error);
        res.status(400).send('ko');
      }
      res.json(_endpointList);
    }
  );
};
