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

import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalEventService } from "spinal-env-viewer-task-service";
import { Event } from '../interfacesContextsEvents'
import { eventNames } from 'process';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {
  /**
* @swagger
* /api/v1/event/{eventId}/read:
*   get:
*     security: 
*       - OauthSecurity: 
*         - readOnly
*     description: Return event 
*     summary: Get event 
*     tags:
*      - Calendar & Event
*     parameters:
*      - in: path
*        name: eventId
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
*                $ref: '#/components/schemas/Event'
*       400:
*         description: Bad request
  */

  app.get("/api/v1/event/:eventId/read", async (req, res, next) => {

    try {
      var event: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.eventId, 10));
      //@ts-ignore
      SpinalGraphService._addNode(event)

      if (event.getType().get() === "SpinalEvent") {
        var info: Event = {
          dynamicId: event._server_id,
          staticId: event.getId().get(),
          name: event.getName().get(),
          type: event.getType().get(),
          groupeId: event.info.groupId.get(),
          categoryId: event.info.categoryId.get(),
          nodeId: event.info.nodeId.get(),
          repeat: event.info.repeat.get(),
          description: event.info.description.get(),
          startDate: event.info.startDate.get(),
          endDate: event.info.endDate.get(),
        };
      }


    } catch (error) {
      console.error(error);
      res.status(400).send("list of event is not loaded");
    }
    res.send(info);
  });
};
