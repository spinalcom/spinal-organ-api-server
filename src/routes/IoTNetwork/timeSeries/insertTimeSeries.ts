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
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import spinalServiceTimeSeries from '../spinalTimeSeries';
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import moment from 'moment';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/endpoint/{id}/timeSeries/insert:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Record a value in the time series at a given date
   *     description: >-
   *       Records a value in the endpoint's time series **at the date given in the body**, which makes
   *       it the route to backfill history. The time series is created if the endpoint does not have
   *       one yet.
   *
   *
   *       Accepted date formats are `DD-MM-YYYY HH:mm:ss`, `DD MM YYYY HH:mm:ss` and
   *       `DD/MM/YYYY HH:mm:ss`, parsed in the server's local time. A date in any other format is
   *       rejected with 400.
   *
   *
   *       This writes only the history; the `currentValue` of the endpoint is left untouched. The route
   *       answers **200 with an empty body**.
   *     tags:
   *       - IoTNetwork & Time Series
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the endpoint.
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
   *               - newValue
   *               - date
   *             properties:
   *               newValue:
   *                 type: number
   *               date:
   *                 type: string
   *                 description: When the value was measured.
   *                 example: 31-01-2024 14:30:00
   *     responses:
   *       200:
   *         description: The value was recorded. The body is empty.
   *       400:
   *         description: The endpoint could not be loaded, or the date could not be parsed.
   *       401:
   *         description: The profile is not allowed to write on this endpoint.
   */

  app.post('/api/v1/endpoint/:id/timeSeries/insert', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const node = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10),
        profileId
      );
      // @ts-ignore
      SpinalGraphService._addNode(node);
      const timeseries = await spinalServiceTimeSeries().getOrCreateTimeSeries(
        node.getId().get()
      );
      const newValue = req.body.newValue;
      const date = moment(
        req.body.date,
        ['DD-MM-YYYY HH:mm:ss', 'DD MM YYYY HH:mm:ss', 'DD/MM/YYYY HH:mm:ss'],
        true
      );
      await timeseries.insert(newValue, date.toDate());
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);

      res.status(400).send();
    }
    res.json();
  });
};
