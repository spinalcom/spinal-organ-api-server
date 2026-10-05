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

import { getProfileId, MULTIPLE_TIMESERIES_IDS_LIMIT, validateArrayRequestLimit } from '../../../utilities/requestUtilities';
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
   *     summary: Read the time series of several endpoints over an interval
   *     description: >-
   *       Batch version of `/api/v1/endpoint/{id}/timeSeries/read/{begin}/{end}` : the body is an array
   *       of endpoint dynamic IDs and the response holds one entry per ID, in the same order.
   *
   *
   *       The same `aggregation` and `bucket` options apply, and they shape each entry the same way :
   *       raw points by default, aggregated measures with `aggregation`, per-bucket values with
   *       `bucket`. `twavg` is the time-weighted average, which weighs every value by how long it
   *       stayed in place.
   *
   *
   *       Each endpoint is read independently : a failure turns its entry into `{ dynamicId, error }`
   *       and the response comes back with **206 Partial Content**. At most 1000 IDs per call
   *       (configurable through `MULTIPLE_TIMESERIES_IDS_LIMIT`).
   *     tags:
   *       - IoTNetwork & Time Series
   *     parameters:
   *       - in: path
   *         name: begin
   *         description: Start of the interval, as `DD-MM-YYYY HH:mm:ss` or `DD MM YYYY HH:mm:ss`.
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: end
   *         description: End of the interval, same formats as `begin`.
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: valueAtBegin
   *         description: >-
   *           Set to `true` to prepend, for each endpoint, the last value known before `begin`.
   *         required: false
   *         schema:
   *           type: string
   *           enum: [false, true]
   *           default: 'false'
   *       - in: query
   *         name: aggregation
   *         description: >-
   *           Comma-separated measures to compute instead of the raw points : `sum`, `min`, `max`,
   *           `avg`, `twavg` (alias `time_weighted_avg`), or `all`.
   *         required: false
   *         schema:
   *           type: string
   *           example: "sum,min,max,avg"
   *       - in: query
   *         name: bucket
   *         description: >-
   *           Split the interval into sub-intervals of this size and aggregate inside each one.
   *           Accepts `hour`, `day`, `week` and `month`.
   *         required: false
   *         schema:
   *           type: string
   *           example: "hour"
   *     requestBody:
   *       required: true
   *       description: The dynamic IDs of the endpoints.
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: integer
   *               format: int64
   *     responses:
   *       200:
   *         description: Every endpoint was read.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/TimeserieWithID'
   *       206:
   *         description: At least one endpoint could not be read; those entries hold an error instead.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 oneOf:
   *                   - $ref: '#/components/schemas/TimeserieWithID'
   *                   - $ref: '#/components/schemas/Error'
   *       400:
   *         description: >-
   *           The body is not an array, it holds more IDs than the configured limit, a date could not
   *           be parsed ("invalid date"), or the `aggregation` value is unknown.
   */

  app.post(
    '/api/v1/endpoint/timeSeries/read_multiple/:begin/:end',
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const ids = req.body;
        const validationError = validateArrayRequestLimit(ids, 'IDs', MULTIPLE_TIMESERIES_IDS_LIMIT);
        if (validationError) {
          return res.status(400).send(validationError);
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
          getTimeSeriesData(spinalAPIMiddleware, profileId, id, timeSeriesIntervalDate, includeLastBeforeStart)
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
