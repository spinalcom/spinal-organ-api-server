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

import SpinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { spinalControlPointService } from 'spinal-env-viewer-plugin-control-endpoint-service'
import { SpinalBmsEndpoint } from 'spinal-model-bmsnetwork';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: SpinalAPIMiddleware) {
  /**
* @swagger
* /api/v1/node/{id}/control_endpoint_list:
*   get:
*     security: 
*       - OauthSecurity: 
*         - readOnly
*     description: Return list of control endpoint
*     summary: Gets a list of control endpoint
*     tags:
*      - Nodes
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
*                $ref: '#/components/schemas/EndPointNode'
*       400:
*         description: Bad request
 */



  app.get("/api/v1/node/:id/control_endpoint_list", async (req, res, next) => {

    try {

      let room = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      // @ts-ignore
      SpinalGraphService._addNode(room);
      var profils = await SpinalGraphService.getChildren(room.getId().get(), [spinalControlPointService.ROOM_TO_CONTROL_GROUP])
      var promises = profils.map(async (profile) => {

        // var result = await spinalControlPointService.getEndpointsNodeLinked(room.getId().get(), profile.id.get())
        var result = await SpinalGraphService.getChildren(profile.id.get(), [SpinalBmsEndpoint.relationName])
        var endpoints = await result.map(async (endpoint) => {
          var realNode = SpinalGraphService.getRealNode(endpoint.id.get())
          var element = await endpoint.element.load()
          var currentValue = element.currentValue.get();
          return {
            dynamicId: realNode._server_id,
            staticId: endpoint.id.get(),
            name: element.name.get(),
            type: element.type.get(),
            currentValue: currentValue
          };
        })
        return { profileName: profile.name.get(), endpoints: await Promise.all(endpoints) }
      })

      var allNodes = await Promise.all(promises)


    } catch (error) {
      console.error(error);
      res.status(400).send("list of endpoints is not loaded");
    }
    res.send(allNodes);
  });
}
