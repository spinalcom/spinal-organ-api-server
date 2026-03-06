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
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinalTimeSeries_1 = require("../spinalTimeSeries");
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
   *     description: get time series
   *     summary: get time series
   *     tags:
   *       - IoTNetwork & Time Series
   *     parameters:
   *      - in: path
   *        name: id
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: begin
   *        description: Date Format is DD-MM-YYYY HH:mm:ss or DD MM YYYY HH:mm:ss
   *        required: true
   *        schema:
   *          type: string
   *      - in: path
   *        name: end
   *        description: Date Format is DD-MM-YYYY hh:mm:ss or DD MM YYYY HH:mm:ss
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
   *          Comma-separated list of aggregation operations to apply on the data.
   *          Supported values: sum, min, max, avg, twavg, time_weighted_avg, all.
   *          Use 'all' to get sum, min, max, and avg at once.
   *          If not provided, raw time series data is returned.
   *        required: false
   *        schema:
   *          type: string
   *          example: "sum,min,max,avg"
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
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               oneOf:
   *                 - $ref: '#/components/schemas/Timeserie'
   *                 - type: object
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
   *                     count:
   *                       type: integer
   *       400:
   *         description: Bad request
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
                    // Parse aggregation ops; default to twavg only when no aggregation specified
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