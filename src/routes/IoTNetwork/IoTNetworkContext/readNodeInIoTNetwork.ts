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

import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { findOneInContext } from '../../../utilities/findOneInContext';
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { IoTNetwork } from '../interfacesEndpointAndTimeSeries'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
  * @swagger
  * /api/v1/IoTNetworkContext/{IoTNetworkId}/node/{nodeId}/read:
  *   get:
  *     security:
  *       - bearerAuth:
  *         - readOnly
  *     description: read a node in IoTNetwork
  *     summary: read a node in IoTNetwork
  *     tags:
  *       - IoTNetwork & Time Series
  *     parameters:
  *       - in: path
  *         name: IoTNetworkId
  *         description: use the dynamic ID
  *         required: true
  *         schema:
  *           type: integer
  *           format: int64
  *       - in: path
  *         name: nodeId
  *         description: use the dynamic ID
  *         required: true
  *         schema:
  *           type: integer
  *           format: int64
  *     responses:
  *       200:
  *         description: Success
  *         content:
  *           application/json:
  *             schema:
  *                $ref: '#/components/schemas/IoTNetwork'
  *       400:
  *         description: Bad request
  */

  app.get("/api/v1/IoTNetworkContext/:IoTNetworkId/node/:nodeId/read", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      var IoTNetwork: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.IoTNetworkId, 10), profileId);
      var node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10), profileId);
      // @ts-ignore
      SpinalGraphService._addNode(node);

      if (IoTNetwork.getType().get() === "Network" && typeof node !== "undefined") {
        var info: IoTNetwork = {
          dynamicId: node._server_id,
          staticId: node.getId().get(),
          name: node.getName().get(),
          type: node.getType().get(),
        }
      }
      else if (IoTNetwork.getType().get() !== "Network") {
        return res.status(400).send("this context is not a Network");
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(info);
  })
}
