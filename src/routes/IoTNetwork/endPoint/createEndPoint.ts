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
import { NetworkService, ConfigService } from 'spinal-model-bmsnetwork'
import getInstance from "../networkService";
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/endpoint/create:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Create an endpoint under a device
   *     description: >-
   *       Creates a `BmsEndpoint` under an existing device. The network context is taken from the
   *       first context the device belongs to.
   *
   *
   *       The creation is **not awaited** : the route answers **200 with an empty body** as soon as the
   *       write is started, and returns no ID for the new endpoint. Read the device back with
   *       `/api/v1/device/{id}/endpoint_list` to get it.
   *     tags:
   *       - IoTNetwork & Time Series
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - deviceDynamicId
   *               - name
   *               - type
   *               - Unit
   *             properties:
   *               deviceDynamicId:
   *                 type: number
   *                 description: Dynamic ID of the device the endpoint is created under.
   *               name:
   *                 type: string
   *               type:
   *                 type: string
   *                 description: Free-text type of the endpoint (its node type is always `BmsEndpoint`).
   *               Unit:
   *                 type: string
   *                 description: Unit of the measured value. Note the capital U.
   *     responses:
   *       200:
   *         description: The creation was started. The body is empty.
   *       400:
   *         description: The device could not be loaded, or the endpoint could not be created.
   *       401:
   *         description: The profile is not allowed to write on this device.
   */



  app.post("/api/v1/endpoint/create", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const device = await spinalAPIMiddleware.load(parseInt(req.body.deviceDynamicId), profileId)
      //@ts-ignore
      SpinalGraphService._addNode(device);

      const contextId = await device.getContextIds();
      const contextNetwork = SpinalGraphService.getRealNode(contextId[0]);
      const obj = {
        name: req.body.name,
        type: req.body.type,
        children: [],
        nodeTypeName: 'BmsEndpoint',
        Unit: req.body.Unit,
      };
      const configService: ConfigService = {
        contextName: contextNetwork.getName().get(),
        contextType: "Network",
        networkName: "NetworkVirtual",
        networkType: "NetworkVirtual"
      }
      const graph = await spinalAPIMiddleware.getProfileGraph(profileId)
      getInstance().init(graph, configService, true)
      //@ts-ignore
      getInstance().createNewBmsEndpoint(device.getId().get(), obj);
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);

      res.status(400).send();
    }
    res.json();
  })

}
