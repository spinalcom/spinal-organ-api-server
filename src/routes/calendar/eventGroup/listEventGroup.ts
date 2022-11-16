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

import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import spinalAPIMiddleware from '../../../app/spinalAPIMiddleware';
import * as express from 'express';
import { SpinalEventService } from 'spinal-env-viewer-task-service';
import { GroupEvent } from '../interfacesContextsEvents';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/eventContext/{ContextId}/eventCategory/{CategoryId}/group_list:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Return list of event group
   *     summary: Gets a list of event group
   *     tags:
   *      - Calendar & Event
   *     parameters:
   *      - in: path
   *        name: ContextId
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: CategoryId
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
   *                $ref: '#/components/schemas/GroupEvent'
   *       400:
   *         description: Bad request
   */

  app.get(
    '/api/v1/eventContext/:ContextId/eventCategory/:CategoryId/group_list',
    async (req, res, next) => {
      let nodes = [];
      try {
        await spinalAPIMiddleware.getGraph();
        var context: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.ContextId, 10)
        );
        //@ts-ignore
        SpinalGraphService._addNode(context);

        var category: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.CategoryId, 10)
        );
        //@ts-ignore
        SpinalGraphService._addNode(category);

        if (
          context instanceof SpinalContext &&
          category.belongsToContext(context)
        ) {
          if (context.getType().get() === 'SpinalEventGroupContext') {
            var listGroupEvents = await SpinalEventService.getEventsGroups(
              category.getId().get()
            );

            for (const child of listGroupEvents) {
              // @ts-ignore
              const _child = SpinalGraphService.getRealNode(child.id.get());
              if (_child.getType().get() === 'SpinalEventGroup') {
                let info: GroupEvent = {
                  dynamicId: _child._server_id,
                  staticId: _child.getId().get(),
                  name: _child.getName().get(),
                  type: _child.getType().get(),
                };
                nodes.push(info);
              }
            }
          } else {
            return res
              .status(400)
              .send('this context is not a SpinalEventGroupContext');
          }
        } else {
          res.status(400).send('node not found in context');
        }
      } catch (error) {
        console.error(error);
        res.status(400).send('list of category event is not loaded');
      }
      res.send(nodes);
    }
  );
};
