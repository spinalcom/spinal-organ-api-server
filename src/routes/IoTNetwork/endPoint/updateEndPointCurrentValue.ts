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

import { SpinalNode } from 'spinal-env-viewer-graph-service'
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { NetworkService, InputDataEndpoint } from 'spinal-model-bmsnetwork';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service'


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {

  /**
* @swagger
 * /api/v1/endpoint/{id}/update:
 *   put:
 *     security: 
 *       - OauthSecurity: 
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
      let savetimeseries: boolean;
      var node: SpinalNode = await spinalAPIMiddleware.load(parseInt(req.params.id, 10))
      SpinalGraphService._addNode(node);
      const allAttributes = await serviceDocumentation.getAllAttributes(node)
      for (const attr of allAttributes) {
        if (attr.label.get() === "savetimeseries") {
          attr.value.get() === 0 ? savetimeseries = false : savetimeseries = true
        }
      }
      const networkService = new NetworkService(savetimeseries);
      const reference: InputDataEndpoint = {
        id: "",
        name: "",
        path: "",
        currentValue: req.body.newValue,
        unit: "",
        dataType: 0,
        type: 0,
        nodeTypeName: ""  // should be SpinalBmsEndpoint.nodeTypeName || 'BmsEndpoint'
      }
      const refNode = SpinalGraphService.getInfo(node.getId().get())
      await networkService.updateEndpoint(refNode, reference)
      var element = await node.element.load();
      info = { NewValue: element.currentValue.get() };
    } catch (error) {
      console.log(error);
      res.status(400).send("ko")
    }
    res.json(info);
  })
}
