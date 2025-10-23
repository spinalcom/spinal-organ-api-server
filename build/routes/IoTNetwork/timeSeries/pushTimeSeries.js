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
// const spinalServiceTimeSeries = require('../../spinalTimeSeries')();
const spinalTimeSeries_1 = require("../spinalTimeSeries");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
    * @swagger
    * /api/v1/endpoint/{id}/timeSeries/push:
    *   post:
    *     security:
    *       - bearerAuth:
    *         - read
    *     description: push new value
    *     summary: push new value
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
    *     requestBody:
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             required:
    *               - newValue
    *             properties:
    *                newValue:
    *                 type: number
    *     responses:
    *       200:
    *         description: Create Successfully
    *       400:
    *         description: Bad request
    */
    app.post("/api/v1/endpoint/:id/timeSeries/push", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.id), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            const timeseries = await (0, spinalTimeSeries_1.default)().getOrCreateTimeSeries(node.getId().get());
            await timeseries.push(req.body.newValue);
            return res.status(200).json({
                newValue: req.body.newValue
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