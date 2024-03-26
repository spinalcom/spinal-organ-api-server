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


// import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { Room } from '../geographicContext/interfacesGeoContext'
import { SpinalNode } from 'spinal-model-graph';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';
import { ISpinalAPIMiddleware } from '../../interfaces';
import { getProfileId } from '../../utilities/requestUtilities';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/command/floor/{id}/roomList_command_enable:
 *   get:
 *     security: 
 *       - bearerAuth: 
 *         - readOnly
 *     description: Return list of room command enable
 *     summary: Gets a list of room command enable
 *     tags:
 *      - Command
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
 *               type: array
 *               items: 
 *                $ref: '#/components/schemas/Room'
 *       400:
 *         description: Bad request
  */

  app.get("/api/v1/command/floor/:id/roomList_command_enable", async (req, res, next) => {

    const nodes = [];
    try {
      const profileId = getProfileId(req);

      const floor = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(floor)

      const rooms = await floor.getChildren("hasGeographicRoom")
      for (const room of rooms) {
        var info;
        const controlPoints = await room.getChildren('hasControlPoints');
        for (const controlPoint of controlPoints) {
          if (controlPoint.getName().get() === "Command") {
            info = {
              dynamicId: room._server_id,
              staticId: room.getId().get(),
              name: room.getName().get(),
              type: room.getType().get(),
              command: "yes",
            }
            nodes.push(info);

          }
        }
      }

    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message)
      res.status(400).send("list of room is not loaded");
    }

    res.send(nodes);

  });
};



