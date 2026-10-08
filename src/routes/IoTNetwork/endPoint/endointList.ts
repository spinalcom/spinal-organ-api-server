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
   * /api/v1/device/{id}/endpoint_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the endpoints of a device
   *     description: >-
   *       Returns the `BmsEndpoint` children of a device, as `{ dynamicId, staticId, name, type }`.
   *
   *
   *       Values are not included here : read one endpoint with `/api/v1/endpoint/{id}/read`, several
   *       at once with `/api/v1/endpoint/read_multiple`, or use
   *       `/api/v1/node/{id}/endpoint_list` on the device to get the endpoints with their current
   *       values in a single call.
   *     tags:
   *      - IoTNetwork & Time Series
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the device.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The endpoints of the device (an empty array if there are none).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/IoTNetwork'
   *       400:
   *         description: The device could not be loaded ("list of endpoints is not loaded").
   *       401:
   *         description: The profile is not allowed to read this device.
   */



  app.get("/api/v1/device/:id/endpoint_list", async (req, res, next) => {

    const nodes = [];
    try {
      const profileId = getProfileId(req);
      const device = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      // @ts-ignore
      SpinalGraphService._addNode(device);
      const endpoints = await device.getChildren("hasBmsEndpoint");

      for (const endpoint of endpoints) {
        const info: IoTNetwork = {
          dynamicId: endpoint._server_id,
          staticId: endpoint.getId().get(),
          name: endpoint.getName().get(),
          type: endpoint.getType().get()
        };
        nodes.push(info);
      }

    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);

      res.status(400).send("list of endpoints is not loaded");
    }
    res.send(nodes);
  });
}
