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
  SpinalNode,
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
   * /api/v1/endpoint/{id}/timeSeries/readCurrentWeek:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Read the time series of the last 7 days
   *     description: >-
   *       Returns the points recorded over the **last 7 days**, counted back from now. Despite the
   *       name, this is a rolling 7-day window, not the current calendar week.
   *
   *
   *       The points come back as `{ date, value }`, oldest first. For any other interval, or for
   *       aggregated values, use `/api/v1/endpoint/{id}/timeSeries/read/{begin}/{end}`.
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
   *     responses:
   *       200:
   *         description: The recorded points over the window (an empty array if none).
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/Timeserie'
   *       400:
   *         description: The endpoint could not be loaded, or its time series could not be read.
   *       401:
   *         description: The profile is not allowed to read this endpoint.
   */

  app.get(
    '/api/v1/endpoint/:id/timeSeries/readCurrentWeek',
    async (req, res, next) => {
      try {
        const profileId = getProfileId(req);
        const node: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.id, 10),
          profileId
        );
        // @ts-ignore
        SpinalGraphService._addNode(node);
        const timeSeriesIntervalDate =
          spinalServiceTimeSeries().getDateFromLastDays(7);
        const datas = await spinalServiceTimeSeries().getData(
          node.getId().get(),
          timeSeriesIntervalDate
        );
        return res.json(datas);
      } catch (error) {
        if (error.code && error.message)
          return res.status(error.code).send(error.message);
        return res.status(400).send(error.message);
      }
    }
  );
};
