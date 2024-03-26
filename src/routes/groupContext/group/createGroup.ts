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
   * /api/v1/groupeContext/{contextId}/category/{categoryId}/create_group:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: create group
   *     summary: create group
   *     tags:
   *       - Group Context
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
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - groupName
   *               - colorName
   *             properties:
   *                groupName:
   *                 type: string
   *                colorName:
   *                 type: string
   *     responses:
   *       200:
   *         description: Create Successfully
   *       400:
   *         description: Bad request
   */

  app.post(
    '/api/v1/groupeContext/:contextId/category/:categoryId/create_group',
    async (req, res, next) => {
      try {
        const profileId = getProfileId(req);
        const context: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.contextId, 10),
          profileId
        );
        //@ts-ignore
        SpinalGraphService._addNode(context);
        const category: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.categoryId, 10),
          profileId
        );
        //@ts-ignore
        SpinalGraphService._addNode(category);

        if (
          context instanceof SpinalContext &&
          category.belongsToContext(context)
        ) {
          const node = await groupManagerService.addGroup(
            context.getId().get(),
            category.getId().get(),
            req.body.groupName,
            req.body.colorName
          );
          let serverId = node._server_id;
          let count = 5;
          while (serverId === undefined && count >= 0) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            serverId = node._server_id;
            count--;
          }
          const info = {
            dynamicId: serverId || -1,
            staticId: node.getId().get(),
            name: node.getName().get(),
            type: node.getType().get(),
          };
          return res.json(info);
        } else {
          return res.status(400).send('category not found in context');
        }
      } catch (error) {
        if (error.code && error.message)
          return res.status(error.code).send(error.message);

        return res.status(400).send(error.message);
      }
      res.json();
    }
  );
};
