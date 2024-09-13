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
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";


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
      let area;
      const profileId = getProfileId(req);
      const graph = await spinalAPIMiddleware.getProfileGraph(profileId);

      const contexts = await graph.getChildren("hasContext");
      
      // var geographicContexts = await SpinalGraphService.getContextWithType("geographicContext");
      const geographicContexts = contexts.filter(el => el.getType().get() === "geographicContext");
      const buildings = await geographicContexts[0].getChildren("hasGeographicBuilding");
      const building = buildings[0];

      const addressAttributes = await serviceDocumentation.getAttributesByCategory(building,'Spinal Building Information');
      const spatialAttributes = await serviceDocumentation.getAttributesByCategory(building,'Spatial');

      for(const addressAttribute of addressAttributes){
        if(addressAttribute.label.get() === 'Adresse'){
          address = addressAttribute.value.get();
        }
      }
      for(const spatialAttribute of spatialAttributes){
        if(spatialAttribute.label.get() === 'area'){
          area = spatialAttribute.value.get();
        }
      }

      const info: Building = {
        dynamicId: building._server_id,
        staticId: building.getId().get(),
        name: building.getName().get(),
        type: building.getType().get(),
        address: address,
        area: area
      }
      return res.json(info); 
      
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
  });
}
