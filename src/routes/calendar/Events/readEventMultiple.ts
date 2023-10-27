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

import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalEventService } from 'spinal-env-viewer-task-service';
import { Event } from '../interfacesContextsEvents';
import { getEventInfo } from '../../../utilities/getEventInfo';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/event/read_multiple:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Returns details for multiple events
   *     summary: Get details of multiple events
   *     tags:
   *       - Calendar & Event
   *     requestBody:
   *       description: An array of event IDs to fetch details for
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: integer
   *               format: int64
   *     responses:
   *       200:
   *         description: Success - All event details fetched
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Event'
   *       206:
   *         description: Partial Content - Some event details could not be fetched
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 oneOf:
   *                   - $ref: '#/components/schemas/Event'
   *                   - $ref: '#/components/schemas/Error'
   *       400:
   *         description: List of events is not loaded
   */
  app.post('/api/v1/event/read_multiple', async (req, res, next) => {
    try {
      const ids: number[] = req.body;

      if (!Array.isArray(ids)) {
        return res.status(400).send('Expected an array of IDs.');
      }

      // Map each id to a promise
      const promises = ids.map((id) => getEventInfo(spinalAPIMiddleware, id));

      const settledResults = await Promise.allSettled(promises);

      const finalResults = settledResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Error with event id ${ids[index]}: ${result.reason}`);
          return {
            eventId: ids[index],
            error:
              result.reason?.message ||
              result.reason ||
              'Failed to get Event Info',
          };
        }
      });

      const isGotError = settledResults.some(
        (result) => result.status === 'rejected'
      );
      if (isGotError) return res.status(206).json(finalResults);
      return res.status(200).json(finalResults);
    } catch (error) {
      console.error(error);
      res.status(400).send('List of events is not loaded');
    }
  });
};
