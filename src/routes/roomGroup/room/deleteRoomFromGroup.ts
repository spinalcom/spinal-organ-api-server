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

// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import groupManagerService from 'spinal-env-viewer-plugin-group-manager-service';
import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/roomsGroup/{contextId}/category/{categoryId}/group/{groupId}/deleteRooms:
   *   delete:
   *     security:
   *       - bearerAuth:
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
   *     requestBody:
   *       description: array of string (dynamicId)
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: number
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

  app.delete(
    '/api/v1/roomsGroup/:contextId/category/:categoryId/group/:groupId/deleteRooms',
    async (req, res, next) => {
      try {
        const profileId = getProfileId(req);
        const _roomList = req.body;
        const context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
        //@ts-ignore
        SpinalGraphService._addNode(context);

        const category: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
        //@ts-ignore
        SpinalGraphService._addNode(category);

        const group: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.groupId, 10), profileId);
        //@ts-ignore
        SpinalGraphService._addNode(group);

        if (context instanceof SpinalContext && category.belongsToContext(context) && group.belongsToContext(context)) {
          if (context.getType().get() === 'geographicRoomGroupContext') {
            if (_roomList.length > 0) {
              for (let index = 0; index < _roomList.length; index++) {
                const realNode: SpinalNode<any> = await spinalAPIMiddleware.load(
                  parseInt(_roomList[index], 10)
                );
                //@ts-ignore
                SpinalGraphService._addNode(realNode);
                if (realNode.getType().get() === 'geographicRoom') {
                  groupManagerService.unLinkElementToGroup(
                    group.getId().get(),
                    realNode.getId().get()
                  );
                } else {
                  res
                    .status(400)
                    .send('one of nodes is not type of geographicRoom');
                }
              }
            } else {
              res.status(400).send(' list of room id is empty ');
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

        if (error.code && error.message) return res.status(error.code).send(error.message);
        res.status(400).send('ko');
      }
      res.json();
    }
  );
};
