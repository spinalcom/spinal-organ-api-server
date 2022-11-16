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

import SpinalAPIMiddleware from '../../../app/spinalAPIMiddleware';
import * as express from 'express';
import { NetworkService, ConfigService } from 'spinal-model-bmsnetwork';
import getInstance from '../networkService';
import {
  SpinalContext,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: SpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/Network/create:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - read
   *     description: create Network
   *     summary: create Network
   *     tags:
   *       - IoTNetwork & Time Series
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - IoTNetworkContext_DynamicId
   *               - NetworkName
   *               - NetworkTypeName
   *             properties:
   *                IoTNetworkContext_DynamicId:
   *                 type: string
   *                NetworkName:
   *                 type: string
   *                NetworkTypeName:
   *                 type: string
   *     responses:
   *       200:
   *         description: Create Successfully
   *       400:
   *         description: Bad request
   */

  app.post('/api/v1/Network/create', async (req, res, next) => {
    try {
      var context = await spinalAPIMiddleware.load(
        parseInt(req.body.IoTNetworkContext_DynamicId)
      );
      // @ts-ignore
      SpinalGraphService._addNode(context);

      let configService: ConfigService = {
        contextName: context.getName().get(),
        contextType: 'IoTNetwork',
        networkName: req.body.NetworkName,
        networkType: req.body.NetworkTypeName,
      };
      getInstance().init(
        await spinalAPIMiddleware.getGraph(),
        configService,
        true
      );
    } catch (error) {
      console.error(error);
      res.status(400).send();
    }
    res.json();
  });
};
