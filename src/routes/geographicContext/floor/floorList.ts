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
import { Floor } from '../interfacesGeoContext'
import { SpinalNode } from 'spinal-model-graph';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/floor/list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Return list of floor
   *     summary: Gets a list of floor
   *     tags:
   *      - Geographic Context
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/Floor'
   *       400:
   *         description: Bad request
   */

  app.get('/api/v1/floor/list', async (req, res, next) => {
    const nodes = [];
    try {
      const { spec } = req.query;
      const profileId = getProfileId(req);
      const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
      const contexts = await graph.getChildren("hasContext");

      // var geographicContexts = await SpinalGraphService.getContextWithType("geographicContext");
      const geographicContexts = contexts.filter(el => el.getType().get() === "geographicContext");
      const buildings = await geographicContexts[0].getChildren("hasGeographicBuilding");
      const floors = await buildings[0].getChildren("hasGeographicFloor")
      for (const floor of floors) {
        var info;
        const categories = await floor.getChildren(NODE_TO_CATEGORY_RELATION);

        if (spec === "archipel") {
          for (const category of categories) {
            if (category.getName().get() === "default") {
              var attributs = (await category.element.load()).get();
              for (const attr of attributs) {
                if (attr.label === "showOccupant") {
                  if (attr.value === true || attr.value === "true") {

                    info = {
                      dynamicId: floor._server_id,
                      staticId: floor.getId().get(),
                      name: floor.getName().get(),
                      type: floor.getType().get(),
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
          const categoriesTab = [];
          for (const category of categories) {
            var attributs = (await category.element.load()).get();
            const catInfo = {
              dynamicId: category._server_id,
              staticId: category.getId().get(),
              name: category.getName().get(),
              type: category.getType().get(),
              attributs: attributs
            }
            categoriesTab.push(catInfo)
          }
          info = {
            dynamicId: floor._server_id,
            staticId: floor.getId().get(),
            name: floor.getName().get(),
            type: floor.getType().get(),
            categories: categoriesTab
          };
          nodes.push(info);
        }
      }














      // for (const child of floors) {
      //   let info: Floor = {
      //     dynamicId: child._server_id,
      //     staticId: child.getId().get(),
      //     name: child.getName().get(),
      //     type: child.getType().get()
      //   };
      //   nodes.push(info);
      // }

      function showInfo(name, attributes) {
        for (const attr of attributes) {
          if (attr.label === name) {
            return attr.value
          }
        }
      }
    } catch (error) {
      console.error(error);
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send("list of floor is not loaded");
    }

    res.send(nodes);

  });
};
