"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const spinalTimeSeries_1 = __importDefault(require("../spinalTimeSeries"));
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const getTimeSeriesData_1 = require("../../../utilities/getTimeSeriesData");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/endpoint/timeSeries/readCurrentWeek_multiple:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Read the time series of the last 7 days for several endpoints
     *     description: >-
     *       Returns the points recorded over the **last 7 days**, counted back from now. Despite the
     *       name, this is a rolling 7-day window, not the current calendar week.
     *
     *
     *       The body is an array of endpoint dynamic IDs and the response holds one
     *       `{ dynamicId, timeseries }` entry per ID, in the same order. Each endpoint is read
     *       independently : a failure turns its entry into `{ dynamicId, error }` and the response comes
     *       back with **206 Partial Content**.
     *
     *
     *       At most 1000 IDs per call, configurable on the organ through `MULTIPLE_TIMESERIES_IDS_LIMIT`
     *       (a separate setting from the one used by the other batch routes).
     *     tags:
     *       - IoTNetwork & Time Series
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
     *         description: The body is not an array, or it holds more IDs than the configured limit.
     */
    app.post('/api/v1/endpoint/timeSeries/readCurrentWeek_multiple', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ids = req.body; // Directly using the body as the array of IDs
            const validationError = (0, requestUtilities_1.validateArrayRequestLimit)(ids, 'IDs', requestUtilities_1.MULTIPLE_TIMESERIES_IDS_LIMIT);
            if (validationError) {
                return res.status(400).send(validationError);
            }
            const timeSeriesIntervalDate = (0, spinalTimeSeries_1.default)().getDateFromLastDays(7);
            // Map each id to a promise
            const promises = ids.map((id) => (0, getTimeSeriesData_1.getTimeSeriesData)(spinalAPIMiddleware, profileId, id, timeSeriesIntervalDate));
            const settledResults = await Promise.allSettled(promises);
            const finalResults = settledResults.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return { dynamicId: ids[index], timeseries: result.value };
                }
                else {
                    console.error(`Error with id ${ids[index]}: ${result.reason}`);
                    return {
                        dynamicId: ids[index],
                        error: result.reason?.message ||
                            result.reason ||
                            'Failed to get Time Series Data',
                    };
                }
            });
            const isGotError = settledResults.some((result) => result.status === 'rejected');
            if (isGotError) {
                return res.status(206).json(finalResults);
            }
            return res.status(200).json(finalResults);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res
                .status(400)
                .send(error.message || 'Error in fetching time series data');
        }
    });
};
//# sourceMappingURL=readTimeSeriesCurrentWeekMultiple.js.map