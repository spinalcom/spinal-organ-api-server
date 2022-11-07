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

import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {

  /**
 * @swagger
 * /api/v1/equipement/{id}/get_postion:
 *   get:
 *     security: 
 *       - OauthSecurity: 
 *         - readOnly
 *     description: Get equipement position 
 *     summary: Get equipement position
 *     tags:
 *       - Geographic Context
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
 *                $ref: '#/components/schemas/Position'
 *       400:
 *         description: Bad request
  */

  app.get("/api/v1/equipement/:id/get_postion", async (req, res, next) => {
    try {

      var equipement: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      //@ts-ignore
      SpinalGraphService._addNode(equipement)

      var context = SpinalGraphService.getRealNode(equipement.getContextIds()[0])
      var parentEquipements = await equipement.getParents("hasBimObject");
      var room: SpinalNode<any>;
      for (const parent of parentEquipements) {
        if (parent.getType().get() === "geographicRoom") {
          room = parent;
        }
      }

      var parentRooms = await room.getParents("hasGeographicRoom");
      var floor: SpinalNode<any>;
      for (const parent of parentRooms) {
        if (parent.getType().get() === "geographicFloor") {
          floor = parent;
        }
      }

      var parentFloors = await floor.getParents("hasGeographicFloor");
      var building: SpinalNode<any>;
      for (const parent of parentFloors) {
        if (parent.getType().get() === "geographicBuilding") {
          building = parent;
        }
      }

      if (equipement.getType().get() === "BIMObject") {
        var info = {
          dynamicId: equipement._server_id,
          staticId: equipement.getId().get(),
          name: equipement.getName().get(),
          type: equipement.getType().get(),
          info: {
            context: {
              dynamicId: context._server_id,
              staticId: context.getId().get(),
              name: context.getName().get(),
              type: context.getType().get()
            },
            building: {
              dynamicId: building._server_id,
              staticId: building.getId().get(),
              name: building.getName().get(),
              type: building.getType().get()
            },
            floor: {
              dynamicId: floor._server_id,
              staticId: floor.getId().get(),
              name: floor.getName().get(),
              type: floor.getType().get()
            },
            room: {
              dynamicId: room._server_id,
              staticId: room.getId().get(),
              name: room.getName().get(),
              type: room.getType().get()
            }
          }
        }
      } else {
        res.status(400).send("node is not of type BimObject");
      }

    } catch (error) {
      console.log(error);
      res.status(400).send("ko");
    }
    res.json(info);
  });
}
