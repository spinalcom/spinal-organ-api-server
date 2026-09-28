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

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/device/create:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Create a device under a network
   *     description: >-
   *       Creates a `BmsDevice` under an existing network. The network context is taken from the first
   *       context the network belongs to.
   *
   *
   *       The creation is **not awaited** : the route answers **200 with an empty body** as soon as the
   *       write is started, and returns no ID for the new device. Read the network back with
   *       `/api/v1/Network/{id}/device_list` to get it.
   *     tags:
   *       - IoTNetwork & Time Series
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - networkDynamicId
   *               - name
   *               - type
   *             properties:
   *               networkDynamicId:
   *                 type: number
   *                 description: Dynamic ID of the network the device is created under.
   *               name:
   *                 type: string
   *               type:
   *                 type: string
   *                 description: Free-text type of the device (its node type is always `BmsDevice`).
   *     responses:
   *       200:
   *         description: The creation was started. The body is empty.
   *       400:
   *         description: The network could not be loaded, or the device could not be created.
   *       401:
   *         description: The profile is not allowed to write on this network.
   */



  app.post("/api/v1/device/create", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const network = await spinalAPIMiddleware.load(parseInt(req.body.networkDynamicId), profileId)
      //@ts-ignore
      SpinalGraphService._addNode(network);
      const contextId = await network.getContextIds();
      const contextNetwork = SpinalGraphService.getRealNode(contextId[0])
      const obj = {
        name: req.body.name,
        type: req.body.type,
        children: [],
        nodeTypeName: 'BmsDevice'
      }
      const configService: ConfigService = {
        contextName: contextNetwork.getName().get(),
        contextType: "Network",
        networkName: network.getName().get(),
        networkType: "NetworkVirtual"
      }

      const graph = await spinalAPIMiddleware.getProfileGraph(profileId)
      getInstance().init(graph, configService, true)
      //@ts-ignore
      getInstance().createNewBmsDevice(network.getId().get(), obj);
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send();
    }
    res.json();
  })

}
