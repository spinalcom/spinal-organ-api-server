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
import SpinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { IoTNetwork } from "../interfacesEndpointAndTimeSeries";
import { SpinalGraph } from 'spinal-model-graph';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: SpinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/device/{id}/endpoint_list:
 *   get:
 *     security:
 *       - OauthSecurity:
 *         - readOnly
 *     description: Return list of endpoint
 *     summary: Gets a list of endpoint
 *     tags:
 *      - IoTNetwork & Time Series
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
 *               type: array
 *               items: 
 *                $ref: '#/components/schemas/IoTNetwork'
 *       400:
 *         description: Bad request
 */



  app.get("/api/v1/device/:id/endpoint_list", async (req, res, next) => {

    let nodes = [];
    try {

      let device = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      // @ts-ignore
      SpinalGraphService._addNode(device);
      var endpoints = await device.getChildren("hasBmsEndpoint");

      for (const endpoint of endpoints) {
        let info: IoTNetwork = {
          dynamicId: endpoint._server_id,
          staticId: endpoint.getId().get(),
          name: endpoint.getName().get(),
          type: endpoint.getType().get()
        };
        nodes.push(info);
      }

    } catch (error) {
      console.error(error);
      res.status(400).send("list of endpoints is not loaded");
    }
    res.send(nodes);
  });
}
