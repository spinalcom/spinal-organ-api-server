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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinalTimeSeries_1 = __importDefault(require("../spinalTimeSeries"));
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/endpoint/{id}/timeSeries/readFromLast24H:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Read the time series of the last 24 hours
     *     description: >-
     *       Returns the points recorded over the **last 24 hours**, counted back from now.
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
    app.get('/api/v1/endpoint/:id/timeSeries/readFromLast24H', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            const timeSeriesIntervalDate = (0, spinalTimeSeries_1.default)().getDateFromLastHours(24);
            const datas = await (0, spinalTimeSeries_1.default)().getData(node.getId().get(), timeSeriesIntervalDate);
            return res.json(datas);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send(error.message);
        }
    });
};
//# sourceMappingURL=readTimeSeriesFrom%20Last24H.js.map