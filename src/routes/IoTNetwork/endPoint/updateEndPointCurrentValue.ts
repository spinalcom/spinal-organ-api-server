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
import { SpinalNode } from 'spinal-env-viewer-graph-service'
import spinalServiceTimeSeries from '../spinalTimeSeries'
import * as express from 'express';
import { CurrentValue } from '../interfacesEndpointAndTimeSeries'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
* @swagger
 * /api/v1/endpoint/{id}/update:
 *   put:
 *     security: 
 *       - bearerAuth: 
 *         - read
 *     description: update the current value of endpoint 
 *     summary: update the current value of endpoint
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
 *         description: Success
 *         content:
 *           application/json:
 *             schema: 
 *                $ref: '#/components/schemas/NewValue'
 *       400:
 *         description: Bad request
  */

  const { NODE_TO_CATEGORY_RELATION } = require('spinal-env-viewer-plugin-documentation-service/dist/Models/constants')
  const { SpinalGraphService } = require('spinal-env-viewer-graph-service')
  app.put("/api/v1/endpoint/:id/update", async (req, res, next) => {
    let info;
    try {
      const profileId = getProfileId(req);
      const node : SpinalNode = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId)
      SpinalGraphService._addNode(node);
     
      const timeseries = await spinalServiceTimeSeries().getOrCreateTimeSeries(node.getId().get())
      await timeseries.push(req.body.newValue);
      const element = await node.element.load();
      element.currentValue.set(req.body.newValue)
      node.info.directModificationDate.set(Date.now());
      info = { NewValue: element.currentValue.get() };
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send(error.message)
    }

    res.json(info);
  })
}
