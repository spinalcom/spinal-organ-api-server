/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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
import { findOneInContext } from '../../utilities/findOneInContext';
import { spinalCore, FileSystem } from 'spinal-core-connectorjs_type';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/command:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Set command value
   *     summary: Set command value
   *     tags:
   *      - Command
   *     requestBody:
   *       description: set current value, float attribute
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               context:
   *                 type: string
   *               propertyReference:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     dynamicId:
   *                       type: string
   *                     staticId:
   *                       type: string
   *                     keys:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           key:
   *                             type: string
   *                           value:
   *                             type: string
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

  app.post('/api/v1/node/command', async (req, res, next) => {
    try {
      const paramContext = req.body.context;
      let context: SpinalContext<any>;
      async function verifyContext(paramContext: string) {
        if (typeof FileSystem._objects[paramContext] !== 'undefined') {
          return (context = await spinalAPIMiddleware.load(
            parseInt(paramContext, 10)
          ));
        } else if (SpinalGraphService.getRealNode(paramContext)) {
          return (context = SpinalGraphService.getRealNode(paramContext));
        } else if (SpinalGraphService.getContext(paramContext)) {
          return (context = SpinalGraphService.getContext(paramContext));
        } else {
          res.status(400).send('context not exist');
        }
      }
      let _node: SpinalNode<any>
      const nodetypes = ["geographicRoom", "BIMObject", "BIMObjectGroup", "geographicRoomGroup", "geographicFloor"];
      //const controlPointTypes = ["COMMAND_BLIND", "COMMAND_LIGHT", "COMMAND_TEMP"];
      const controlPointTypes = ["COMMAND_BLIND", "COMMAND_BLIND_ROTATION", "COMMAND_LIGHT", "COMMAND_TEMPERATURE"];
      const nodes = req.body.propertyReference;
      for (const node of nodes) {
        if (node.dynamicId.length !== 0) {
          _node = await spinalAPIMiddleware.load(parseInt(node.dynamicId, 10));
        } else if (node.staticId.length !== 0) {
          if (paramContext === undefined) {
            res.status(400).send('context not exist');
          }
          context = await verifyContext(paramContext);
          _node = SpinalGraphService.getRealNode(
            node.staticId
          );
          if (typeof _node === 'undefined') {
            _node = await findOneInContext(
              context,
              context,
              (n) => n.getId().get() === node.staticId
            );
          }
          if (_node) {
            if (context instanceof SpinalContext &&
              _node.belongsToContext(context)) { continue }
            else {
              res.status(400).send('this node does not belong to this context');
            }
          }
        }

        if (nodetypes.includes(_node.getType().get())) {
          for (const command of node.keys) {
            if (controlPointTypes.includes(command.key)) {
              let controlPoints = await _node.getChildren('hasControlPoints');
              for (const controlPoint of controlPoints) {
                if (controlPoint.getName().get() === "Command") {
                  let bmsEndpointsChildControlPoint = await controlPoint.getChildren('hasBmsEndpoint')
                  for (const bmsEndPoint of bmsEndpointsChildControlPoint) {
                    if (bmsEndPoint.getName().get() === command.key) {
                      await updateControlEndpointWithAnalytic(bmsEndPoint, command.value, InputDataEndpointDataType.Real, InputDataEndpointType.Other)
                    }
                  }
                }
              }
            } else {
              res.status(400).send("unkown key");
            }
          }
        } else {
          res.status(400).send("one of the node is not of type authorized");
        }
      }
    } catch (error) {
      console.error(error);
      res.status(400).send("one of node is not loaded");
    }

    res.send("Endpoint updated");
  });
};


