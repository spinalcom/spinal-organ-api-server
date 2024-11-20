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

// import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { updateControlEndpointWithAnalytic } from './../../utilities/upstaeControlEndpoint'
import { NetworkService, InputDataEndpoint, InputDataEndpointDataType, InputDataEndpointType } from "spinal-model-bmsnetwork"
import { ISpinalAPIMiddleware } from '../../interfaces';
import { getProfileId } from '../../utilities/requestUtilities';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/command/room/{id}/blind:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Set command blind value
   *     summary: Set command blind value
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
   *               - blindCurrentValue
   *             properties:
   *               blindCurrentValue:
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

  app.post('/api/v1/command/room/:id/blind', async (req, res, next) => {
    try {
      let info;
      const profileId = getProfileId(req);
      const room = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(room)
      const controlPoints = await room.getChildren('hasControlPoints');
      for (const controlPoint of controlPoints) {
        if (controlPoint.getName().get() === "Command") {
          const bmsEndpointsChildControlPoint = await controlPoint.getChildren('hasBmsEndpoint')
          for (const bmsEndPoint of bmsEndpointsChildControlPoint) {
            if (bmsEndPoint.getName().get() === "COMMAND_BLIND") {
              //@ts-ignore
              SpinalGraphService._addNode(bmsEndPoint);
              const model = SpinalGraphService.getInfo(bmsEndPoint.getId().get());
              const element = await bmsEndPoint.element.load()
              await updateControlEndpointWithAnalytic(model, req.body.blindCurrentValue, InputDataEndpointDataType.Real, InputDataEndpointType.Other)
              // var element = await bmsEndPoint.element.load();
              // element.currentValue.set(req.body.blindCurrentValue)
              info = {
                dynamicId: room._server_id,
                staticId: room.getId().get(),
                name: room.getName().get(),
                type: room.getType().get(),
                currentValue: element.currentValue.get()
              }
              return res.send(info);
              
            }
          }
        }
      }
      return res.status(400).send("COMMAND BLIND control endpoint not found in room");
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message)
      res.status(400).send("one of node is not loaded");
    }

  });
};
