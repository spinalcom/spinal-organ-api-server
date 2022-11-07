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


import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Room } from '../interfacesGeoContext'
import { SpinalNode } from 'spinal-model-graph';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/floor/{id}/room_list:
 *   get:
 *     security: 
 *       - OauthSecurity: 
 *         - readOnly
 *     description: Return list of room
 *     summary: Gets a list of room
 *     tags:
 *      - Geographic Context
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

  app.get("/api/v1/floor/:id/room_list", async (req, res, next) => {

    let nodes = [];
    try {

      var floor = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      //@ts-ignore
      SpinalGraphService._addNode(floor)
      const { spec } = req.query;


      var rooms = await floor.getChildren("hasGeographicRoom")
      for (const room of rooms) {
        var info;
        var categories = await room.getChildren(NODE_TO_CATEGORY_RELATION);

        if (spec === "archipel") {

          for (const category of categories) {
            if (category.getName().get() === "default") {
              var attributs = (await category.element.load()).get();
              for (const attr of attributs) {
                if (attr.label === "showOccupant") {
                  if (attr.value === true || attr.value === "true") {

                    info = {
                      dynamicId: room._server_id,
                      staticId: room.getId().get(),
                      name: room.getName().get(),
                      type: room.getType().get(),
                      aliasOccupant: showInfo("aliasOccupant", attributs),
                      idOccupant: showInfo("idOccupant", attributs),
                      bureauOccupant: showInfo("bureauOccupant", attributs),
                      showOccupant: showInfo("showOccupant", attributs),

                    }
                    nodes.push(info);
                  }
                }
              }

            }
          }

        } else {
          var categoriesTab = [];
          for (const category of categories) {
            var attributs = (await category.element.load()).get();
            var catInfo = {
              dynamicId: category._server_id,
              staticId: category.getId().get(),
              name: category.getName().get(),
              type: category.getType().get(),
              attributs: attributs
            }
            categoriesTab.push(catInfo)
          }
          info = {
            dynamicId: room._server_id,
            staticId: room.getId().get(),
            name: room.getName().get(),
            type: room.getType().get(),
            categories: categoriesTab
          };
          nodes.push(info);
        }
      }

      function showInfo(name, attributes) {
        for (const attr of attributes) {
          if (attr.label === name) {
            return attr.value
          }
        }
      }

    } catch (error) {
      console.error(error);
      res.status(400).send("list of room is not loaded");
    }

    res.send(nodes);

  });
};



