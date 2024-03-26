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
import { TICKET_CONTEXT_TYPE, TIKET_TYPE as TICKET_TYPE } from 'spinal-service-ticket';
import * as moment from 'moment'
import { getProfileId } from '../../../utilities/requestUtilities';
import { Period } from 'spinal-env-viewer-task-service'
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/ticket/{id}/create_event:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: create event of ticket
   *     summary: create event of ticket
   *     tags:
   *       - Workflow & ticket
   *     parameters:
   *      - in: path
   *        name: id
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
   *               - name
   *               - startDate
   *               - endDate
   *               - description
   *               - repeat
   *               - repeatEnd
   *               - count
   *               - period
   *               - user
   *             properties:
   *               name:
   *                 type: string
   *               startDate:
   *                 type: string
*                 default: DD MM YYYY HH:mm:ss
   *               endDate:
   *                 type: string
*                 default: DD MM YYYY HH:mm:ss
   *               description:
   *                 type: string
   *               repeat:
   *                 type: boolean
   *               repeatEnd:
*                 type: string
*                 default: DD MM YYYY HH:mm:ss
   *               count:
   *                 type: number
   *               period:
*                 type: string
*                 default: day|week|month|year
   *               user:
   *                 type: object
   *                 required:
   *                   - userName
   *                   - email
   *                   - gsm
   *                 properties:
*                   userName:
   *                     type: string
   *                   email:
   *                     type: string
   *                   gsm:
   *                     type: string
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
  app.post("/api/v1/ticket/:id/create_event", async (req, res, next) => {
    try {
      await spinalAPIMiddleware.getGraph();
      const profileId = getProfileId(req);
      const node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(node)

      const tree = await SpinalEventService.createOrgetDefaultTreeStructure();
      const context: any = tree.context
      const category: any = tree.category
      const group: any = tree.group


      if (node.getType().get() === TICKET_TYPE) {
        if (context.type.get() === "SpinalEventGroupContext") {
          const eventInfo = {
            contextId: context.id.get(),
            groupId: group.id.get(),
            categoryId: category.id.get(),
            nodeId: node.getId().get(),
            startDate: moment(
              req.body.startDate,
              'DD MM YYYY HH:mm:ss',
              true
            ).toString(),
            description: req.body.description,
            endDate: moment(
              req.body.endDate,
              'DD MM YYYY HH:mm:ss',
              true
            ).toString(),
            periodicity: { count: req.body.count, period: Period[req.body.period] },
            repeat: req.body.repeat,
            name: req.body.name,
            creationDate: moment(new Date().toISOString()).toString(),
            repeatEnd: moment(
              req.body.repeatEnd,
              'DD MM YYYY HH:mm:ss',
              true
            ).toString(),
          };
          const user = {
            username: req.body.user.userName,
            email: req.body.user.email,
            gsm: req.body.user.gsm,
          };

          const result: any = await SpinalEventService.createEvent(
            context.id.get(),
            group.id.get(),
            node.getId().get(),
            eventInfo,
            user
          );
          const ticketCreated = SpinalGraphService.getRealNode(result.id.get());
          console.log(ticketCreated._server_id);

          var info = {
            dynamicId: ticketCreated._server_id,
            staticId: ticketCreated.getId().get(),
            name: ticketCreated.getName().get(),
            type: ticketCreated.getType().get(),
            groupID: ticketCreated.info.groupId.get(),
            categoryID: ticketCreated.info.categoryId.get(),
            nodeId: ticketCreated.info.nodeId.get(),
            startDate: ticketCreated.info.startDate.get(),
            endDate: ticketCreated.info.endDate.get(),
            creationDate: ticketCreated.info.creationDate.get(),
            user: {
              username: ticketCreated.info.user.username.get(),
              email:
                ticketCreated.info.user.email == undefined
                  ? undefined
                  : ticketCreated.info.user.email.get(),
              gsm:
                ticketCreated.info.user.gsm == undefined
                  ? undefined
                  : ticketCreated.info.user.gsm.get(),
            },
          };
        } else {
          return res
            .status(400)
            .send('this context is not a SpinalEventGroupContext');
        }
      } else {
        res.status(400).send('the node is not of type Ticket');
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(info);
  })
}



