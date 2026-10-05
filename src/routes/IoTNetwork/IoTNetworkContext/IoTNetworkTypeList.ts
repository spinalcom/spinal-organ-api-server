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
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/IoTNetworkContext/{id}/nodeTypeList:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the node types found in a network context
   *     description: >-
   *       Browses a network context and returns the distinct node types it contains, typically
   *       `BmsNetwork`, `BmsDevice` and `BmsEndpoint`. The node must be a context of type `Network`.
   *     tags:
   *       - IoTNetwork & Time Series
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the network context.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The distinct node types present in the context.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/IoTNetworkNodeTypeList'
   *       400:
   *         description: >-
   *           The node is not a network context ("this context is not a Network"), or it could not be
   *           loaded ("context not found").
   *       401:
   *         description: The profile is not allowed to read this context.
   */
  app.get("/api/v1/IoTNetworkContext/:id/nodeTypeList", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const IoTNetwork = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      const SpinalContextId = IoTNetwork.getId().get();
      if (IoTNetwork.getType().get() === "Network") {
        var type_list = await SpinalGraphService.browseAndClassifyByTypeInContext(SpinalContextId, SpinalContextId);
      }
      else {
        res.status(400).send("this context is not a Network");
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send("context not found");
    }
    res.json(type_list.types);
  });


}
