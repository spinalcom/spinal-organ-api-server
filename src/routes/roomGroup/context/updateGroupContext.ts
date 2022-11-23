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

import SpinalAPIMiddleware from '../../../app/spinalAPIMiddleware';
import * as express from 'express';
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/roomsGroup/{id}/update:
 *   put:
 *     security: 
 *       - OauthSecurity: 
 *         - read
 *     description: update group context roomsGroup
 *     summary: update group context roomsGroup
 *     tags:
 *       - Rooms Group
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
 *               - newGroupRoomContextName
 *             properties:
 *                newGroupRoomContextName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Update Successfully
 *       400:
 *         description: Bad request
*/



  app.put("/api/v1/roomsGroup/:id/update", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      var groupContext: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(groupContext)
      if (groupContext.getType().get() === "geographicRoomGroupContext") {
        groupContext.getName().set(req.body.newGroupRoomContextName)
      } else {
        res.status(400).send("node is not type of geographicRoomGroupContext ");
      }
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send("ko")
    }
    res.json();
  })

}
