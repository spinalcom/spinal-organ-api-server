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
import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { updateControlEndpointWithAnalytic } from './../../utilities/upstaeControlEndpoint'
import { NetworkService, InputDataEndpoint, InputDataEndpointDataType, InputDataEndpointType } from "spinal-model-bmsnetwork"

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/command/room/{id}/temp:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Set command temp value
   *     summary: Set command temp value
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
   *     requestBody:
   *       description: set current value, float attribute
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - tempCurrentValue
   *             properties:
   *               tempCurrentValue:
   *                 type: number
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/Command'
   *       400:
   *         description: Bad request
   */

  app.post('/api/v1/command/room/:id/temp', async (req, res, next) => {
    var info;
    try {

      var room = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      //@ts-ignore
      SpinalGraphService._addNode(room)

      var controlPoints = await room.getChildren('hasControlPoints');
      for (const controlPoint of controlPoints) {
        if (controlPoint.getName().get() === "Command") {
          var bmsEndpointsChildControlPoint = await controlPoint.getChildren('hasBmsEndpoint')
          for (const bmsEndPoint of bmsEndpointsChildControlPoint) {
            if (bmsEndPoint.getName().get() === "COMMAND_TEMPERATURE") {
              var element = await bmsEndPoint.element.load()
              await updateControlEndpointWithAnalytic(bmsEndPoint, req.body.tempCurrentValue, InputDataEndpointDataType.Real, InputDataEndpointType.Other)

              // element.currentValue.set(req.body.tempCurrentValue)
              // info = {
              //   dynamicId: room._server_id,
              //   staticId: room.getId().get(),
              //   name: room.getName().get(),
              //   type: room.getType().get(),
              //   currentValue: element.currentValue.get()
              // }
            }
          }
        }
      }



    } catch (error) {
      console.error(error);
      res.status(400).send("list of room is not loaded");
    }

    res.send(info);
  });
};
