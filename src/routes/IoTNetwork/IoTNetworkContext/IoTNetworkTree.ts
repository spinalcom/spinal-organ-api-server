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
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { IoTNetworkTree } from '../interfacesEndpointAndTimeSeries'
import { recTree } from '../../../utilities/recTree'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
  * @swagger
  * /api/v1/IoTNetworkContext/{id}/tree:
  *   get:
  *     security:
  *       - bearerAuth:
  *         - readOnly
  *     description: Return tree of IoTNetwork
  *     summary: Get a tree IoTNetwork by ID
  *     tags:
  *       - IoTNetwork & Time Series
  *     parameters:
  *      - in: path
  *        name: id
  *        description: use the dynamic ID
  *        required: true
  *        schema:
  *          type: integer
  *          format: int64
  *     responses:
  *       200:
  *         description: Success
  *         content:
  *           application/json:
  *             schema:
  *                $ref: '#/components/schemas/IoTNetworkTree'
  *       400:
  *         description: Bad request
  */

  app.get("/api/v1/IoTNetworkContext/:id/tree", async (req, res, next) => {
    let IoTNetworks: IoTNetworkTree;

    try {
      const profileId = getProfileId(req);
      const IoTNetwork = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      if (IoTNetwork instanceof SpinalContext) {
        IoTNetworks = {
          dynamicId: IoTNetwork._server_id,
          staticId: IoTNetwork.getId().get(),
          name: IoTNetwork.getName().get(),
          type: IoTNetwork.getType().get(),
          children: await recTree(IoTNetwork, IoTNetwork)
        };
      }
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);

      res.status(500).send(error.message);
    }
    res.json(IoTNetworks);
  });

}
