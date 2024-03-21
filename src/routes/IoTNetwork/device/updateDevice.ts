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

import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
 * @swagger
 * /api/v1/device/{id}/update:
 *   put:
 *     security: 
 *       - bearerAuth: 
 *         - read
 *     description: update the device
 *     summary: update the device
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newNameNetwork
 *             properties:
 *                newNameNetwork:
 *                 type: string
 *     responses:
 *       200:
 *         description: Update Success
 *       400:
 *         description: Bad request
*/

  app.put("/api/v1/device/:id/update", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const device = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId)
      // @ts-ignore
      SpinalGraphService._addNode(device);
      if (device.getType().get() === "BmsDevice") {
        device.info.name.set(req.body.newNameNetwork)
      }
      else {
        res.status(400).send("this node is not a BmsDevice");
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send(error.message)
    }

    res.json();
  })
}
