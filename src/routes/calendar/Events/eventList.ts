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
import * as express from 'express';
import { SpinalEventService } from 'spinal-env-viewer-task-service';
import { Event } from '../interfacesContextsEvents';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/eventContext/{ContextId}/eventCategory/{CategoryId}/eventGroup/{GroupId}/event_list:
   *   get:
   *     security:
   *      - bearerAuth: 
   *        - read
   *     description: Return list of event
   *     summary: Gets a list of event
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
   *      - in: path
   *        name: GroupId
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
   *                $ref: '#/components/schemas/Event'
   *       400:
   *         description: Bad request
   */

  app.get(
    '/api/v1/eventContext/:ContextId/eventCategory/:CategoryId/eventGroup/:GroupId/event_list',
    async (req, res, next) => {
      const eventarray = [];
      try {
        const profileId = getProfileId(req);
    
        const context: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.ContextId, 10),profileId
        );
        //@ts-ignore
        SpinalGraphService._addNode(context);

        const category: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.CategoryId, 10),profileId
        );
        //@ts-ignore
        SpinalGraphService._addNode(category);


        const group: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.GroupId, 10),profileId
        );
        //@ts-ignore
        SpinalGraphService._addNode(group);

        if (
          context instanceof SpinalContext &&
          category.belongsToContext(context)
        ) {
          if (context.getType().get() === 'SpinalEventGroupContext') {
            const listGroupEvents = await SpinalEventService.getEventsGroups(
              category.getId().get()
            );
            for (const child of listGroupEvents) {
              if (child.id.get() === group.getId().get()) {
                const eventList = await group.getChildren('groupHasSpinalEvent')
                for (const event of eventList) {
                  const objEvent: Event = {
                    dynamicId: event._server_id,
                    staticId: event.getId().get(),
                    name: event.getName().get(),
                    type: event.getType().get(),
                    groupId: event.info.groupId.get(),
                    categoryId: event.info.categoryId.get(),
                    nodeId: event.info.nodeId.get(),
                    repeat: event.info.repeat.get(),
                    description: event.info.description.get(),
                    startDate: event.info.startDate.get(),
                    endDate: event.info.endDate.get(),
                  }
                  eventarray.push(objEvent);
                }
              }
            }
          } else {
            return res
              .status(400)
              .send('this context is not a SpinalEventGroupContext');
          }
        } else {
          res.status(400).send('node not found in context');
          return
        }
        res.send(eventarray);
      } catch (error) {
        console.error(error)
        if (error.code && error.message) return res.status(error.code).send(error.message);
        res.status(500).send(error.message);
      }
     
    }
  );
};
