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
import {
  computeAggregation,
  computeTimeWeightedMean,
  computeBucketedAggregation,
  toTimestamp,
  parseAggregationParam,
  parseBucketParam,
  VALID_OPS,
} from '../../../utilities/aggregationUtils';

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
   *      - in: query
   *        name: valueAtBegin
   *        description: If true, the last known timeserie before the begin date will be included. Default is 'false'.
   *        required: false
   *        schema:
   *          type: string
   *          enum: [false, true]
   *      - in: query
   *        name: aggregation
   *        description: >
   *          Comma-separated list of aggregation operations to apply on each endpoint's data.
   *          Supported values: sum, min, max, avg, twavg, time_weighted_avg, all.
   *          Use 'all' to get sum, min, max, avg and twavg at once.
   *          If not provided, raw time series data is returned for each endpoint.
   *        required: false
   *        schema:
   *          type: string
   *          example: "min,max,avg,twavg"
   *      - in: query
   *        name: bucket
   *        description: >
   *          Split the interval into sub-intervals of the given size and compute
   *          the requested aggregations per bucket. If no aggregation is specified,
   *          defaults to twavg. Supported formats: hour, day, week, month.
   *        required: false
   *        schema:
   *          type: string
   *          example: "hour"
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
        const includeLastBeforeStart = req.query.valueAtBegin == "true" ? true : false;

        const { normalizedOps, basicOps, needsTwavg } = parseAggregationParam(
          req.query.aggregation as string
        );

        const bucketMs = parseBucketParam(req.query.bucket as string);

        if (req.query.aggregation && !normalizedOps && !bucketMs) {
          return res.status(400).send(
            `Invalid aggregation parameter. Supported values: ${VALID_OPS.join(', ')}, all`
          );
        }

        const intervalStart = toTimestamp(timeSeriesIntervalDate.start);
        const intervalEnd = toTimestamp(timeSeriesIntervalDate.end);

        const promises = ids.map((id) =>
          getTimeSeriesData(spinalAPIMiddleware,profileId ,id, timeSeriesIntervalDate,includeLastBeforeStart)
        );

        const settledResults = await Promise.allSettled(promises);

        const finalResults = settledResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            const datas = result.value;

            if (bucketMs) {
              const bucketOps = normalizedOps
                ? { basicOps, needsTwavg }
                : { basicOps: [] as string[], needsTwavg: true };

              const buckets = computeBucketedAggregation(
                datas, intervalStart, intervalEnd, bucketMs,
                bucketOps.basicOps, bucketOps.needsTwavg
              );
              return { dynamicId: ids[index], buckets };
            }

            if (normalizedOps) {
              const aggregationResult = computeAggregation(datas, basicOps);
              if (needsTwavg) {
                aggregationResult.twavg = computeTimeWeightedMean(datas, intervalStart, intervalEnd);
              }
              return { dynamicId: ids[index], ...aggregationResult };
            }

            return { dynamicId: ids[index], timeseries: datas };
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
