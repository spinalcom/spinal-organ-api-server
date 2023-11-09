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
const spinalTimeSeries_1 = require("../spinalTimeSeries");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const getTimeSeriesData_1 = require("../../../utilities/getTimeSeriesData");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/endpoint/timeSeries/readCurrentDay_multiple:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Retrieve time series data for the current day for multiple IDs.
     *     summary: Time series data for the current day for multiple IDs
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
     *     responses:
     *       200:
     *         description: Success - All time series data for the current day fetched
     *         content:
     *           application/json:
     *             schema:
     *                type: array
     *                items:
     *                  $ref: '#/components/schemas/TimeserieWithID'
     *       206:
     *         description: Partial Content - Some time series data for the current day could not be fetched
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 oneOf:
     *                   - $ref: '#/components/schemas/TimeserieWithID'
     *                   - $ref: '#/components/schemas/Error'
     *       400:
     *         description: Bad request - Incorrect request format or data
     */
    app.post('/api/v1/endpoint/timeSeries/readCurrentDay_multiple', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const ids = req.body; // Directly using the body as the array of IDs
            if (!Array.isArray(ids)) {
                return res.status(400).send('Expected an array of IDs.');
            }
            const date = new Date(Date.now());
            const lastHour = date.getHours();
            const timeSeriesIntervalDate = (0, spinalTimeSeries_1.default)().getDateFromLastHours(lastHour);
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
//# sourceMappingURL=readTimeSeriesCurrentDayMultiple.js.map