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
import { NetworkService, ConfigService } from 'spinal-model-bmsnetwork';
import getInstance from '../networkService';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: SpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/IoTNetworkContext/create:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - read
   *     description: create network context
   *     summary: create network context
   *     tags:
   *       - IoTNetwork & Time Series
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - configNetworkContext
   *             properties:
   *                contextName:
   *                 type: string
   *                networkName:
   *                 type: string
   *     responses:
   *       200:
   *         description: Create Successfully
   *       400:
   *         description: Bad request
   */

  app.post('/api/v1/IoTNetworkContext/create', async (req, res, next) => {
    try {
      let configService: ConfigService = {
        contextName: req.body.contextName,
        contextType: 'Network',
        networkName: req.body.networkName,
        networkType: 'NetworkVirtual',
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
