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
import { IoTNetwork } from '../interfacesEndpointAndTimeSeries';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: SpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/Network/list:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Return list of Network
   *     summary: Gets a list of Network
   *     tags:
   *      - IoTNetwork & Time Series
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

  app.get('/api/v1/Network/list', async (req, res, next) => {
    let nodes = [];
    let contextNetwork;
    try {
      const graph = await spinalAPIMiddleware.getGraph();

      var childrens = await graph.getChildren('hasContext');

      for (const child of childrens) {
        if (child.getType().get() === 'Network') {
          contextNetwork = child;
          break;
        }
      }
      var networks = await contextNetwork.getChildrenInContext(contextNetwork);

      for (const network of networks) {
        let info: IoTNetwork = {
          dynamicId: network._server_id,
          staticId: network.getId().get(),
          name: network.getName().get(),
          type: network.getType().get(),
        };
        nodes.push(info);
      }
    } catch (error) {
      console.error(error);
      res.status(400).send('list of networks is not loaded');
    }
    res.send(nodes);
  });
};
