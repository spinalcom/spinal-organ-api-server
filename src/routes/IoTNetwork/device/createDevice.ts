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
   *         - read
   *     description: create device
   *     summary: create device
   *     tags:
   *       - IoTNetwork & Time Series
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - configDevice
   *             properties:
   *                networkDynamicId:
   *                 type: number
   *                 description: optional
   *                name:
   *                 type: string
   *                type:
   *                 type: string
   *     responses:
   *       200:
   *         description: Create Successfully
   *       400:
   *         description: Bad request
   */



  app.post("/api/v1/device/create", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      var network = await spinalAPIMiddleware.load(parseInt(req.body.networkDynamicId), profileId)
      //@ts-ignore
      SpinalGraphService._addNode(network);
      var contextId = await network.getContextIds();
      var contextNetwork = SpinalGraphService.getRealNode(contextId[0])
      var obj = {
        name: req.body.name,
        type: req.body.type,
        children: [],
        nodeTypeName: 'BmsDevice'
      }
      let configService: ConfigService = {
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
