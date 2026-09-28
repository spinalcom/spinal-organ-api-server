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

// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { IoTNetwork } from "../interfacesEndpointAndTimeSeries";
import { SpinalGraph } from 'spinal-model-graph';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/Network/{id}/device_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the devices of a network
   *     description: >-
   *       Returns the `BmsDevice` children of a network, as `{ dynamicId, staticId, name, type }`. Use
   *       a returned `dynamicId` with `/api/v1/device/{id}/endpoint_list` to reach its endpoints.
   *     tags:
   *      - IoTNetwork & Time Series
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the network.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The devices of the network (an empty array if there are none).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/IoTNetwork'
   *       400:
   *         description: The network could not be loaded ("list of devices is not loaded").
   *       401:
   *         description: The profile is not allowed to read this network.
   */



  app.get("/api/v1/Network/:id/device_list", async (req, res, next) => {

    const nodes = [];
    try {
      const profileId = getProfileId(req);
      const network = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      // @ts-ignore
      SpinalGraphService._addNode(network);
      const devices = await network.getChildren("hasBmsDevice");

      for (const device of devices) {
        const info: IoTNetwork = {
          dynamicId: device._server_id,
          staticId: device.getId().get(),
          name: device.getName().get(),
          type: device.getType().get()
        };
        nodes.push(info);
      }

    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);

      res.status(400).send("list of devices is not loaded");
    }
    res.send(nodes);
  });
}
