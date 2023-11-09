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

import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { verifDate } from '../../../utilities/dateFunctions';
import { getTimeSeriesData } from '../../../utilities/getTimeSeriesData';

import * as express from 'express';


module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/endpoint/timeSeries/read_multiple/{begin}/{end}:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Get time series for multiple IDs
   *     summary: Get time series for multiple IDs
   *     tags:
   *       - IoTNetwork & Time Series
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: integer
   *               format: int64
   *     parameters:
   *      - in: path
   *        name: begin
   *        description: Date Format is DD-MM-YYYY HH:mm:ss or DD MM YYYY HH:mm:ss
   *        required: true
   *        schema:
   *          type: string
   *      - in: path
   *        name: end
   *        description: Date Format is DD-MM-YYYY HH:mm:ss or DD MM YYYY HH:mm:ss
   *        required: true
   *        schema:
   *          type: string
   *     responses:
   *       200:
   *         description: Success - All time series data fetched
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/TimeserieWithID'
   *       206:
   *         description: Partial Content - Some time series data could not be fetched
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 oneOf:
   *                   - $ref: '#/components/schemas/TimeserieWithID'
   *                   - $ref: '#/components/schemas/Error'
   *       400:
   *         description: Bad request
   */

  app.post(
    '/api/v1/endpoint/timeSeries/read_multiple/:begin/:end',
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const ids = req.body;
        if (!Array.isArray(ids)) {
          return res.status(400).send('Expected an array of IDs.');
        }
        if (
          verifDate(req.params.begin) === 1 ||
          verifDate(req.params.end) === 1
        ) {
          throw 'invalid date';
        }

        const timeSeriesIntervalDate = {
          start: verifDate(req.params.begin),
          end: verifDate(req.params.end),
        };
        // Map each id to a promise
        const promises = ids.map((id) =>
          getTimeSeriesData(spinalAPIMiddleware,profileId ,id, timeSeriesIntervalDate)
        );

        const settledResults = await Promise.allSettled(promises);

        const finalResults = settledResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            return { dynamicId: ids[index], timeseries: result.value };
          } else {
            console.error(`Error with id ${ids[index]}: ${result.reason}`);
            return {
              dynamicId: ids[index],
              error:
                result.reason?.message ||
                result.reason ||
                'Failed to get Time Series Data',
            };
          }
        });

        const isGotError = settledResults.some(
          (result) => result.status === 'rejected'
        );
        if (isGotError) {
          return res.status(206).json(finalResults);
        }
        return res.status(200).json(finalResults);
      } catch (error) {
        if (error.code && error.message) return res.status(error.code).send(error.message);
        return res
          .status(400)
          .send(error.message || 'Error in fetching time series data');
      }
    }
  );
};
