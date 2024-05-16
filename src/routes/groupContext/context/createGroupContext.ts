/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/groupContext/create:
 *   post:
 *     security: 
 *       - bearerAuth: 
 *         - read
 *     description: create group context
 *     summary: create group context
 *     tags:
 *       - Group Context
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contextName
 *               - childrenType
 *             properties:
 *                contextName:
 *                 type: string
 *                childrenType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Create Successfully
 *       400:
 *         description: Bad request
*/



  app.post("/api/v1/groupContext/create", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
      if (!userGraph) res.status(406).send(`No graph found for ${profileId}`);

      const graph = await spinalAPIMiddleware.getGraph();
      await SpinalGraphService.setGraph(graph);

      const node = await groupManagerService.createGroupContext(req.body.contextName, req.body.childrenType,userGraph);


      let serverId = node._server_id;
        let count = 5;
        while (serverId === undefined && count >= 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          serverId = node._server_id;
          count--;
        }
        const info = {
          dynamicId: serverId || -1,
          staticId: node.getId().get(),
          name: node.getName().get(),
          type: node.getType().get(),
        };

      res.status(200).json(info);
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send(error.message)
    }
  })

}
