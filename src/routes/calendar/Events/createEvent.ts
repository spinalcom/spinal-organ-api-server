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
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { CONTEXT_TYPE, Period, SpinalEventService } from "spinal-env-viewer-task-service";
import * as moment from 'moment'
import { getProfileId } from '../../../utilities/requestUtilities';



module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {

  /**
* @swagger
* /api/v1/event/create:
*   post:
*     security: 
*       - OauthSecurity: 
*         - read
*     description: create event
*     summary: create event
*     tags:
*       - Calendar & Event
*     requestBody:
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - name
*               - contextId
*               - categoryDynamicId
*               - groupDynamicId
*               - nodeDynamicId
*               - startDate
*               - endDate
*               - description
*               - repeat
*               - repeatEnd
*               - count
*               - period
*             properties:
*               name:
*                 type: string
*               contextId:
*                 type: number
*               categoryDynamicId:
*                 type: number
*               groupDynamicId:
*                 type: number
*               nodeDynamicId:
*                 type: number
*               startDate:
*                 type: string
*                 default: YYYY-MM-DD
*               endDate:
*                 type: string
*                 default: YYYY-MM-DD
*               description:
*                 type: string
*               repeat:
*                 type: boolean
*               repeatEnd:
*                 type: number
*                 default: YYYY-MM-DD
*               count:
*                 type: number
*               period:
*                 type: number
*                 default: day|week|month|year
*     responses:
*       200:
*         description: Updated successfully
*       400:
*         description: Bad request
  */
  app.post("/api/v1/event/create", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      var context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.body.contextId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(context)
      var groupe: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.body.groupDynamicId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(groupe)
      var node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.body.nodeDynamicId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(node)
      var category: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.body.categoryDynamicId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(category)

      if (context instanceof SpinalContext) {
        if (context.getType().get() === CONTEXT_TYPE) {
          let eventInfo = {
            contextId: context.getId().get(),
            groupId: groupe.getId().get(),
            categoryId: category.getId().get(),
            nodeId: node.getId().get(),
            startDate: (moment(new Date(req.body.startDate))).toString(),
            description: req.body.description,
            endDate: (moment(new Date(req.body.endDate))).toString(),
            periodicity: { count: req.body.count, period: Period[req.body.period] },
            repeat: req.body.repeat,
            name: req.body.name,
            creationDate: (moment(new Date().toISOString())).toString(),
            repeatEnd: (moment(new Date(req.body.repeatEnd))).toString()
          }
          let user = { username: "admin", userId: 168 }

          let result = await SpinalEventService.createEvent(context.getId().get(), groupe.getId().get(), node.getId().get(), eventInfo, user)
          if (!Array.isArray(result)) result = [result];

          const infos = result.map(ticketCreated => {
            const node = SpinalGraphService.getRealNode(ticketCreated.id.get());
            return {
              dynamicId: node._server_id,
              staticId: ticketCreated.id.get(),
              name: ticketCreated.name.get(),
              type: ticketCreated.type.get(),
              groupeId: ticketCreated.groupId.get(),
              categoryId: ticketCreated.categoryId.get(),
              nodeId: ticketCreated.nodeId.get(),
              startDate: ticketCreated.startDate.get(),
              endDate: ticketCreated.endDate.get(),
              creationDate: ticketCreated.creationDate.get(),
              user: {
                username: ticketCreated.user.username.get(),
                email: ticketCreated.user.email == undefined ? undefined : ticketCreated.user.email.get(),
                gsm: ticketCreated.user.gsm == undefined ? undefined : ticketCreated.user.gsm.get()
              }
            }
          })

          return res.status(200).json(infos);

        }
        else {
          return res.status(400).send("this context is not a SpinalEventGroupContext");
        }
      } else {
        res.status(400).send("node not found in context");
      }

    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
  })
}


// {
//   "name": "new event",
//   "contextId": 36833568,
//   "categoryDynamicId": 27212448,
//   "groupDynamicId": 26609392,
//   "nodeDynamicId": 295528528,
//   "startDate": "18/03/2022",
//   "endDate": "19/03/2022",
//   "description": "hello world",
//   "repeat": false,
//   "repeatEnd": 19/03/2022,
//   "count": 0,
//   "period": 0
// }