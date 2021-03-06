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
import { getProfileId } from '../../../utilities/requestUtilities';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: SpinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/Network/{id}/device_list:
 *   get:
 *     security:
 *       - OauthSecurity:
 *         - readOnly
 *     description: Return list of device
 *     summary: Gets a list of device
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



  app.get("/api/v1/Network/:id/device_list", async (req, res, next) => {

    let nodes = [];
    try {
      const profileId = getProfileId(req);
      let network = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      // @ts-ignore
      SpinalGraphService._addNode(network);
      var devices = await network.getChildren("hasBmsDevice");

      for (const device of devices) {
        let info: IoTNetwork = {
          dynamicId: device._server_id,
          staticId: device.getId().get(),
          name: device.getName().get(),
          type: device.getType().get()
        };
        nodes.push(info);
      }

    } catch (error) {
      console.error(error);
      res.status(400).send("list of devices is not loaded");
    }
    res.send(nodes);
  });
}
