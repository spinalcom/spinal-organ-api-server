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
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { CurrentValue } from '../interfacesEndpointAndTimeSeries'
import { NetworkService } from 'spinal-model-bmsnetwork'

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {


  /**
  * @swagger
  * /api/v1/endpoint/{id}/read:
  *   get:
  *     security:
  *       - OauthSecurity:
  *         - readOnly
  *     description: read the current value of endpoint 
  *     summary: read the current value of endpoint
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
  *     responses:
  *       200:
  *         description: Success
  *         content:
  *           application/json:
  *             schema:
  *                $ref: '#/components/schemas/CurrentValue'
  *       400:
  *         description: Bad request
  */

  app.get("/api/v1/endpoint/:id/read", async (req, res, next) => {
    try {
      var node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10))
      // @ts-ignore
      SpinalGraphService._addNode(node);
      var element = await node.element.load()
      var info = { currentValue: element.currentValue.get() };
    } catch (error) {
      console.log(error);
      res.status(400).send("ko")
    }
    res.json(info);
  })
}
