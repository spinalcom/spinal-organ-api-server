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
   * /api/v1/roomsGroup/{contextId}/category/{categoryId}/group/{groupId}/roomList:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: read room list
   *     summary: Get room list from rooms Group
   *     tags:
   *       - Rooms Group
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
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/BasicNode'
   *       400:
   *         description: Bad request
   */

  app.get(
    '/api/v1/roomsGroup/:contextId/category/:categoryId/group/:groupId/roomList',
    async (req, res, next) => {
      try {
        var _roomList = [];
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
          if (context.getType().get() === 'geographicRoomGroupContext') {
            const roomList = await group.getChildren('groupHasgeographicRoom');
            for (const room of roomList) {
              var info = {
                dynamicId: room._server_id,
                staticId: room.getId().get(),
                name: room.getName().get(),
                type: room.getType().get(),
              };
              _roomList.push(info);
            }
          } else {
            res
              .status(400)
              .send('node is not type of geographicRoomGroupContext ');
          }
        } else {
          res.status(400).send('category or group not found in context');
        }
      } catch (error) {
        console.log(error);
        res.status(400).send('ko');
      }
      res.json(_roomList);
    }
  );
};
