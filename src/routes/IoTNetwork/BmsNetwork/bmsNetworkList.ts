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
import { IoTNetwork } from "../interfacesEndpointAndTimeSeries";
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/Network/list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the networks of the network context
   *     description: >-
   *       Returns the `BmsNetwork` nodes held by the **first** context of type `Network` the profile
   *       can reach. A twin holding several network contexts will always be answered with the first
   *       one; walk `/api/v1/IoTNetworkContext/{id}/tree` to reach the others.
   *     tags:
   *      - IoTNetwork & Time Series
   *     responses:
   *       200:
   *         description: The networks of the context (an empty array if there are none).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/IoTNetwork'
   *       400:
   *         description: The profile graph could not be read ("list of networks is not loaded").
   *       401:
   *         description: The profile is not allowed to read the graph.
   */



  app.get("/api/v1/Network/list", async (req, res, next) => {

    const nodes = [];
    let contextNetwork;
    try {
      const profileId = getProfileId(req);
      const graph = await spinalAPIMiddleware.getProfileGraph(profileId)
      const childrens = await graph.getChildren("hasContext");

      for (const child of childrens) {
        if (child.getType().get() === "Network") {
          contextNetwork = child;
          break;
        }
      }
      const networks = await contextNetwork.getChildrenInContext(contextNetwork)

      for (const network of networks) {
        const info: IoTNetwork = {
          dynamicId: network._server_id,
          staticId: network.getId().get(),
          name: network.getName().get(),
          type: network.getType().get()
        };
        nodes.push(info);
      }

    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send("list of networks is not loaded");
    }
    res.send(nodes);
  });
}
