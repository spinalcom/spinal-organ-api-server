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

import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalEventService } from "spinal-env-viewer-task-service";
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
* @swagger
* /api/v1/event/{eventId}/delete:
*   delete:
*     security: 
*       - bearerAuth: 
*         - read
*     description: delete event
*     summary: delete event 
*     tags:
*       - Calendar & Event
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
*         description: Delete Successfully
*       400:
*         description: Bad request
*/
  app.delete("/api/v1/event/:eventId/delete", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const event: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.eventId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(event)
      if (event.getType().get() === "SpinalEvent") {
        await SpinalEventService.removeEvent(event.getId().get())
      }
      else {
        return res.status(400).send("this event is not of type SpinalEvent");
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json();
  })
}
