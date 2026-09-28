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
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalEventService } from 'spinal-env-viewer-task-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import moment from 'moment';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/event/{eventId}/update:
   *   put:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Update a calendar event
   *     description: >-
   *       Rewrites the fields of an event : name, description, dates and recurrence. The event must
   *       belong to the context given as `contextId`.
   *
   *
   *       Every listed field is applied, so send the current value for anything that should not change.
   *       Dates use the format `DD MM YYYY HH:mm:ss`, and `repeatEnd` matters only when `repeat` is
   *       true.
   *     tags:
   *       - Calendar & Event
   *     parameters:
   *      - in: path
   *        name: eventId
   *        description: Dynamic ID of the event.
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
   *             required:
   *               - contextId
   *               - name
   *               - repeat
   *               - startDate
   *               - endDate
   *             properties:
   *               contextId:
   *                 type: integer
   *                 description: Dynamic ID of the event context the event belongs to.
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               repeat:
   *                 type: boolean
   *               startDate:
   *                 type: string
   *                 default: DD MM YYYY HH:mm:ss
   *               endDate:
   *                 type: string
   *                 default: DD MM YYYY HH:mm:ss
   *               repeatEnd:
   *                 type: string
   *                 default: DD MM YYYY HH:mm:ss
   *                 description: When the recurrence stops. Used when `repeat` is true.
   *               count:
   *                 type: number
   *                 description: Number of `period` units between two occurrences.
   *               period:
   *                 type: string
   *                 description: Unit of the recurrence.
   *                 enum: [day, week, month, year]
   *     responses:
   *       200:
   *         description: The updated event.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/Event'
   *       400:
   *         description: The event does not belong to the given context ("node not found in context").
   *       401:
   *         description: The profile is not allowed to write on this event.
   *       500:
   *         description: The event or the context could not be loaded.
   */
  app.put('/api/v1/event/:eventId/update', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const context: SpinalNode<any> = await spinalAPIMiddleware.load(
        parseInt(req.body.contextId, 10),
        profileId
      );
      //@ts-ignore
      SpinalGraphService._addNode(context);

      const event: SpinalNode<any> = await spinalAPIMiddleware.load(
        parseInt(req.params.eventId, 10),
        profileId
      );
      //@ts-ignore
      SpinalGraphService._addNode(event);

      if (context instanceof SpinalContext && event.belongsToContext(context)) {
        if (context.getType().get() === 'SpinalEventGroupContext') {
          const newEventInfo = {
            name: req.body.name,
            nodeId: event.info.nodeId,
            repeat: req.body.repeat,
            startDate: new Date(
              moment(
                req.body.startDate,
                'DD MM YYYY HH:mm:ss',
                true
              ).toISOString()
            ).toISOString(),
            endDate: new Date(
              moment(
                req.body.endDate,
                'DD MM YYYY HH:mm:ss',
                true
              ).toISOString()
            ).toISOString(),
            periodicity: { count: req.body.count, period: req.body.period },
            creationDate: new Date(
              moment(Date.now(), true).toISOString()
            ).toISOString(),
            repeatEnd: new Date(
              moment(
                req.body.repeatEnd,
                'DD MM YYYY HH:mm:ss',
                true
              ).toISOString()
            ).toISOString(),
          };

          await SpinalEventService.updateEvent(
            event.getId().get(),
            newEventInfo
          );
        } else {
          return res
            .status(400)
            .send('this context is not a SpinalEventGroupContext');
        }
      } else {
        return res.status(400).send('node not found in context');
      }
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json();
  });
};
