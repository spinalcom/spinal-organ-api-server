"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinalTimeSeries_1 = __importDefault(require("../spinalTimeSeries"));
const dateFunctions_1 = require("../../../utilities/dateFunctions");
const aggregationUtils_1 = require("../../../utilities/aggregationUtils");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/endpoint/{id}/timeSeries/read/{begin}/{end}:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Read the time series of an endpoint over an interval
     *     description: >-
     *       Returns the recorded values of an endpoint between two dates. The shape of the response
     *       depends on the query parameters :
     *
     *        * **no `aggregation`, no `bucket`** - the raw points, as `{ date, value }`;
     *
     *        * **`aggregation` alone** - a single object with the requested measures over the whole
     *          interval;
     *
     *        * **`bucket` (with or without `aggregation`)** - `{ dynamicId, buckets }`, one aggregated
     *          entry per sub-interval. Without `aggregation` the bucket measure defaults to `twavg`.
     *
     *
     *       `twavg` is the time-weighted average : each value counts for as long as it stayed in place,
     *       which is what you want for a measure that is only recorded on change. A plain `avg` instead
     *       weighs every recorded point equally.
     *
     *
     *       Both dates are read as `DD-MM-YYYY HH:mm:ss` or `DD MM YYYY HH:mm:ss`; anything else is
     *       rejected. Remember to URL-encode the spaces in the path.
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
     *      - in: path
     *        name: begin
     *        description: Start of the interval, as `DD-MM-YYYY HH:mm:ss` or `DD MM YYYY HH:mm:ss`.
     *        required: true
     *        schema:
     *          type: string
     *      - in: path
     *        name: end
     *        description: End of the interval, same formats as `begin`.
     *        required: true
     *        schema:
     *          type: string
     *      - in: query
     *        name: valueAtBegin
     *        description: >-
     *          Set to `true` to prepend the last value known **before** `begin`, so the series starts
     *          with the value that was in place at the start of the interval instead of at the first
     *          change inside it.
     *        required: false
     *        schema:
     *          type: string
     *          enum: [false, true]
     *          default: 'false'
     *      - in: query
     *        name: aggregation
     *        description: >-
     *          Comma-separated measures to compute instead of returning the raw points : `sum`, `min`,
     *          `max`, `avg`, `twavg` (alias `time_weighted_avg`), or `all` for every one of them. An
     *          unknown value is rejected with 400.
     *        required: false
     *        schema:
     *          type: string
     *          example: "sum,min,max,avg"
     *      - in: query
     *        name: bucket
     *        description: >-
     *          Split the interval into sub-intervals of this size and aggregate inside each one.
     *          Accepts `hour`, `day`, `week` and `month`.
     *        required: false
     *        schema:
     *          type: string
     *          example: "hour"
     *     responses:
     *       200:
     *         description: >-
     *           The raw points, the aggregated measures, or the bucketed series, depending on the query
     *           parameters.
     *         content:
     *           application/json:
     *             schema:
     *               oneOf:
     *                 - $ref: '#/components/schemas/Timeserie'
     *                 - type: object
     *                   description: Aggregated measures over the whole interval.
     *                   properties:
     *                     sum:
     *                       type: number
     *                       nullable: true
     *                     min:
     *                       type: number
     *                       nullable: true
     *                     max:
     *                       type: number
     *                       nullable: true
     *                     avg:
     *                       type: number
     *                       nullable: true
     *                     twavg:
     *                       type: number
     *                       nullable: true
     *                       description: Time-weighted average.
     *                     count:
     *                       type: integer
     *                 - type: object
     *                   description: Bucketed aggregation.
     *                   properties:
     *                     dynamicId:
     *                       type: integer
     *                       format: int64
     *                     buckets:
     *                       type: array
     *                       items:
     *                         type: object
     *       400:
     *         description: >-
     *           A date could not be parsed ("Invalid date make sure the date format is DD-MM-YYYY
     *           HH:mm:ss"), the `aggregation` value is unknown, or the endpoint could not be loaded.
     *       401:
     *         description: The profile is not allowed to read this endpoint.
     */
    app.get("/api/v1/endpoint/:id/timeSeries/read/:begin/:end", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            if ((0, dateFunctions_1.verifDate)(req.params.begin) === 1 || (0, dateFunctions_1.verifDate)(req.params.end) === 1) {
                throw "Invalid date make sure the date format is DD-MM-YYYY HH:mm:ss";
            }
            else {
                const timeSeriesIntervalDate = {
                    start: (0, dateFunctions_1.verifDate)(req.params.begin),
                    end: (0, dateFunctions_1.verifDate)(req.params.end)
                };
                const intervalStart = (0, aggregationUtils_1.toTimestamp)(timeSeriesIntervalDate.start);
                const intervalEnd = (0, aggregationUtils_1.toTimestamp)(timeSeriesIntervalDate.end);
                const includeLastBeforeStart = req.query.valueAtBegin == "true" ? true : false;
                const datas = await (0, spinalTimeSeries_1.default)().getData(node.getId().get(), timeSeriesIntervalDate, includeLastBeforeStart);
                const aggregationParam = req.query.aggregation;
                const bucketMs = (0, aggregationUtils_1.parseBucketParam)(req.query.bucket);
                if (bucketMs) {
                    const { normalizedOps, basicOps, needsTwavg } = aggregationParam
                        ? (0, aggregationUtils_1.parseAggregationParam)(aggregationParam)
                        : { normalizedOps: ['twavg'], basicOps: [], needsTwavg: true };
                    if (aggregationParam && !normalizedOps) {
                        return res.status(400).send(`Invalid aggregation parameter. Supported values: ${aggregationUtils_1.VALID_OPS.join(', ')}, all`);
                    }
                    const buckets = (0, aggregationUtils_1.computeBucketedAggregation)(datas, intervalStart, intervalEnd, bucketMs, basicOps, needsTwavg);
                    return res.json({ dynamicId: parseInt(req.params.id, 10), buckets });
                }
                if (aggregationParam) {
                    const { normalizedOps, basicOps, needsTwavg } = (0, aggregationUtils_1.parseAggregationParam)(aggregationParam);
                    if (!normalizedOps) {
                        return res.status(400).send(`Invalid aggregation parameter. Supported values: ${aggregationUtils_1.VALID_OPS.join(', ')}, all`);
                    }
                    const aggregationResult = (0, aggregationUtils_1.computeAggregation)(datas, basicOps);
                    if (needsTwavg) {
                        aggregationResult.twavg = (0, aggregationUtils_1.computeTimeWeightedMean)(datas, intervalStart, intervalEnd);
                    }
                    return res.json(aggregationResult);
                }
                return res.json(datas);
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            else if (error.message)
                return res.status(400).send(error.message);
            else {
                return res.status(400).send(error);
            }
        }
    });
};
//# sourceMappingURL=readTimeSeries.js.map