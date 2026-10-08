/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

import type { ISpinalAPIMiddleware } from '../../../interfaces/ISpinalAPIMiddleware';
import {
  SpinalGraphService,
  type SpinalNodeRef,
} from 'spinal-env-viewer-graph-service';
import * as express from 'express';
import { SpinalEventService } from 'spinal-env-viewer-task-service';
import { sendDate, verifDate } from '../../../utilities/dateFunctions';
import { getProfileId } from '../../../utilities/requestUtilities';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';
import { SPINAL_TICKET_SERVICE_TICKET_TYPE } from 'spinal-service-ticket';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/ticket/{ticketDynamicId}/event_list:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the calendar events of a ticket over a period
   *     description: >-
   *       Returns the events attached to a ticket, restricted to the period given in the body :
   *
   *        * `all` - every event of the ticket, whatever its date;
   *
   *        * `today` - the events of the current day;
   *
   *        * `week` - the events of the current week. **This is also what an omitted `period`
   *          gives**, not a date interval;
   *
   *        * `dateInterval` - the events between `startDate` and `endDate`, which then become
   *          required.
   *
   *
   *       Dates are read in `DD-MM-YYYY` / `DD-MM-YYYY HH:mm:ss` and their `/` and space variants; an
   *       unparsable date is rejected with 400.
   *     tags:
   *       - Workflow & ticket
   *     parameters:
   *      - in: path
   *        name: ticketDynamicId
   *        description: Dynamic ID of the ticket.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               period:
   *                 type: string
   *                 description: Which events to return. Defaults to `week` when omitted.
   *                 enum: [all, today, week, dateInterval]
   *               startDate:
   *                 type: string
   *                 description: Start of the interval. Only read when `period` is `dateInterval`.
   *                 example: 01-01-2024
   *               endDate:
   *                 type: string
   *                 description: End of the interval. Only read when `period` is `dateInterval`.
   *                 example: 31-01-2024
   *     responses:
   *       200:
   *         description: The events of the ticket over the requested period.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/Event'
   *       400:
   *         description: A date could not be parsed ("invalid Date").
   *       401:
   *         description: The profile is not allowed to read this ticket.
   *       500:
   *         description: The ticket could not be loaded, or it is not a ticket node.
   */
  app.post('/api/v1/ticket/:ticketDynamicId/event_list', async (req, res) => {
    try {
      await spinalAPIMiddleware.getGraph();
      const profileId = getProfileId(req);
      //ticket node
      const nodes = [];
      const node = await loadAndValidateNode(
        spinalAPIMiddleware,
        parseInt(req.params.ticketDynamicId, 10),
        profileId,
        SPINAL_TICKET_SERVICE_TICKET_TYPE
      );
      SpinalGraphService._addNode(node);

      if (req.body.period === 'all') {
        const listEvents = await SpinalEventService.getEvents(
          node.info.id?.get()
        );
        ListEvents(nodes, listEvents);
      } else if (req.body.period === 'today') {
        const start = new Date();
        start.setHours(2, 0, 0, 0);
        const end = new Date();
        end.setHours(25, 59, 59, 999);

        const listEvents = await SpinalEventService.getEvents(
          node.info.id?.get(),
          start,
          end
        );
        ListEvents(nodes, listEvents);
      } else if (req.body.period === undefined || req.body.period === 'week') {
        const curr = new Date(); // get current date
        const first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
        const last = first + 6; // last day is the first day + 6
        const firstday = new Date(curr.setDate(first));
        firstday.setHours(2, 0, 0, 0).toString();
        const lastday = new Date(curr.setDate(last));
        lastday.setHours(25, 59, 59, 999).toString();
        const listEvents = await SpinalEventService.getEvents(
          node.info.id?.get(),
          firstday,
          lastday
        );
        ListEvents(nodes, listEvents);
      } else if (req.body.period === 'dateInterval') {
        if (!verifDate(req.body.startDate) || !verifDate(req.body.endDate)) {
          return res.status(400).send('invalid Date');
        } else {
          const start = sendDate(req.body.startDate);
          const end = sendDate(req.body.endDate);
          const listEvents = await SpinalEventService.getEvents(
            node.info.id?.get(),
            start.toDate(),
            end.toDate()
          );
          ListEvents(nodes, listEvents);
        }
      }
      return res.json(nodes);
    } catch (error) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error?.message);
    }
  });
};

function ListEvents(result, listEvents: SpinalNodeRef[]) {
  for (const childNodeRef of listEvents) {
    const childNode = SpinalGraphService.getRealNode(childNodeRef.id?.get());
    if (childNode.getType()?.get() === 'SpinalEvent') {
      const info = {
        dynamicId: childNode._server_id,
        staticId: childNode.info.id.get(),
        name: childNode.info.name?.get(),
        type: childNode.info.type?.get(),
        groupID: childNode.info.groupId?.get(),
        categoryID: childNode.info.categoryId?.get(),
        nodeId: childNode.info.nodeId?.get(),
        startDate: childNode.info.startDate?.get(),
        endDate: childNode.info.endDate?.get(),
        creationDate: childNode.info.creationDate?.get(),
        user: {
          username: childNode.info.user.username?.get(),
          email: childNode.info.user?.email?.get(),
          gsm: childNode.info.user?.gsm?.get(),
        },
      };

      result.push(info);
    }
  }
}
