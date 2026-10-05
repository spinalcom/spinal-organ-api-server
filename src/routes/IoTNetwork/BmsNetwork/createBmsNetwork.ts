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
   * /api/v1/Network/create:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Create a network in a network context
   *     description: >-
   *       Adds a `BmsNetwork` to an existing context of type `Network`.
   *
   *
   *       The creation is **not awaited** : the route answers **200 with an empty body** as soon as the
   *       write is started, and returns no ID for the new network. Read the context back with
   *       `/api/v1/Network/list` to get it.
   *     tags:
   *       - IoTNetwork & Time Series
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - IoTNetworkContext_DynamicId
   *               - NetworkName
   *               - NetworkTypeName
   *             properties:
   *               IoTNetworkContext_DynamicId:
   *                 type: number
   *                 description: Dynamic ID of the network context the network is created in.
   *               NetworkName:
   *                 type: string
   *               NetworkTypeName:
   *                 type: string
   *                 description: Free-text type of the network.
   *     responses:
   *       200:
   *         description: The creation was started. The body is empty.
   *       400:
   *         description: The context could not be loaded, or the network could not be created.
   *       401:
   *         description: The profile is not allowed to write on this context.
   */



  app.post("/api/v1/Network/create", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const context = await spinalAPIMiddleware.load(parseInt(req.body.IoTNetworkContext_DynamicId), profileId)
      // @ts-ignore
      SpinalGraphService._addNode(context);

      const configService: ConfigService = {
        contextName: context.getName().get(),
        contextType: "IoTNetwork",
        networkName: req.body.NetworkName,
        networkType: req.body.NetworkTypeName
      }
      const graph = await spinalAPIMiddleware.getProfileGraph(profileId)
      getInstance().init(graph, configService, true);
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);

      res.status(400).send()
    }
    res.json();
  })

}
