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
// const spinalServiceTimeSeries = require('../../spinalTimeSeries')();
const spinalTimeSeries_1 = __importDefault(require("../spinalTimeSeries"));
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/endpoint/{id}/timeSeries/push:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Append a value to the time series, dated now
     *     description: >-
     *       Records a value in the endpoint's time series **at the current server time**. The time series
     *       is created if the endpoint does not have one yet.
     *
     *
     *       This writes only the history : the `currentValue` of the endpoint is left untouched. Use
     *       `PUT /api/v1/endpoint/{id}/update` to set the current value (which also records a numeric
     *       value in the time series). To record a value at a chosen date, use
     *       `/api/v1/endpoint/{id}/timeSeries/insert`.
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
     *             properties:
     *               newValue:
     *                 type: number
     *     responses:
     *       200:
     *         description: The value was recorded, echoed back as `{ newValue }`.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 newValue:
     *                   type: number
     *       400:
     *         description: The endpoint could not be loaded, or the value could not be recorded.
     *       401:
     *         description: The profile is not allowed to write on this endpoint.
     */
    app.post('/api/v1/endpoint/:id/timeSeries/push', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.id), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            const timeseries = await (0, spinalTimeSeries_1.default)().getOrCreateTimeSeries(node.getId().get());
            await timeseries.push(req.body.newValue);
            return res.status(200).json({
                newValue: req.body.newValue,
            });
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send(error.message);
        }
    });
};
//# sourceMappingURL=pushTimeSeries.js.map