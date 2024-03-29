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
import { Building } from '../interfacesGeoContext';
import { SpinalNode } from 'spinal-model-graph';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/building/read:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: read building
   *     summary: Gets building
   *     tags:
   *       - Geographic Context
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/Building'
   *       400:
   *         description: Bad request
   */

  app.get("/api/v1/building/read", async (req, res, next) => {
    try {
      let address;
      let sommes = 0;
      const profileId = getProfileId(req);
      const graph = await spinalAPIMiddleware.getProfileGraph(profileId);

      const contexts = await graph.getChildren("hasContext");

      // var geographicContexts = await SpinalGraphService.getContextWithType("geographicContext");
      const geographicContexts = contexts.filter(el => el.getType().get() === "geographicContext");
      const building = await geographicContexts[0].getChildren("hasGeographicBuilding");
      const floors = await building[0].getChildren("hasGeographicFloor")

      for (let index = 0; index < floors.length; index++) {
        const rooms = await floors[index].getChildren("hasGeographicRoom")
        for (const room of rooms) {
          const categories = await room.getChildren(NODE_TO_CATEGORY_RELATION);
          for (const child of categories) {
            if (child.getName().get() === "Spatial") {
              const attributs = await child.element.load();
              for (const attribut of attributs.get()) {
                if (attribut.label === "area") {
                  sommes = sommes + attribut.value
                }
              }
            }
          }
        }
      }


      const categories = await building[0].getChildren(NODE_TO_CATEGORY_RELATION);
      for (const child of categories) {
        if (child.getName().get() === "Spinal Building Information") {
          const attributs = await child.element.load();
          for (const attribut of attributs.get()) {
            if (attribut.label === "Adresse") {
              address = attribut.value
            }
          }
        }
      }
      if (building[0].getType().get() === "geographicBuilding") {
        var info: Building = {
          dynamicId: building[0]._server_id,
          staticId: building[0].getId().get(),
          name: building[0].getName().get(),
          type: building[0].getType().get(),
          address: address,
          area: sommes
        }
      } else {
        res.status(400).send("node is not of type geographic building");
      }

    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(info);
  });
}
