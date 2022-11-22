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

import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service'
// const spinalServiceTimeSeries = require('../../spinalTimeSeries')();
import spinalServiceTimeSeries from '../spinalTimeSeries'
import SpinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import * as moment from 'moment'
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: SpinalAPIMiddleware) {

  /**
  * @swagger
  * /api/v1/endpoint/{id}/timeSeries/push:
  *   post:
  *     security:
  *       - OauthSecurity:
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
      var node = await spinalAPIMiddleware.load(parseInt(req.params.id))
      // @ts-ignore
      SpinalGraphService._addNode(node);

      var timeseries = await spinalServiceTimeSeries().getOrCreateTimeSeries(node.getId().get())
      await timeseries.push(req.body.newValue)
    } catch (error) {
      console.error(error)
      res.status(400).send("ko")
    }
    res.json();
  })

}