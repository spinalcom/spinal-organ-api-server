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

import { ISpinalAPIMiddleware } from '../../interfaces';
import { getProfileId } from '../../utilities/requestUtilities';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/command:
   *   post:
   *     security:
   *       - bearerAuth:
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
      const profileId = getProfileId(req);
      const nodetypes = ["geographicRoom", "BIMObject", "BIMObjectGroup", "geographicRoomGroup", "geographicFloor"];
      const controlPointTypes = ["COMMAND_BLIND", "COMMAND_BLIND_ROTATION", "COMMAND_LIGHT", "COMMAND_TEMPERATURE"];
      const paramContext = req.body.context;
      const nodes = req.body.propertyReference;
      let context: SpinalContext<any>;
      let _node: SpinalNode<any>;


      for (const node of nodes) {
        if(isNumeric(node.dynamicId)) { // If dynamicId is not empty and looks like a number, load the node by dynamicId
          _node = await spinalAPIMiddleware.load(parseInt(node.dynamicId, 10), profileId);
        } else if (node.staticId.length !== 0) { // If staticId is not empty, load the node by staticId
          console.log("node.staticId", node.staticId);
          if (paramContext === undefined) {
            return res.status(400).send('Trying to load a node with staticId but no context provided');
          }
          if (typeof FileSystem._objects[paramContext] !== 'undefined') {
            context = await spinalAPIMiddleware.load(
              parseInt(paramContext, 10), profileId
            );
          } 
          else {
            context = await loadContextByStaticId(paramContext);
            if (!context) {
              return res.status(400).send('Context not found');
            }
          }
          _node = await loadNodeByStaticId(node.staticId, context);

          if (!node) {
            return res.status(400).send('Node could not be found');
          }
          
        }


        
        if(!nodetypes.includes(_node.getType().get())) {
          console.error(`Node with dynamicId ${node.dynamicId} is not of type authorized... Skipping it`);
          continue;
        }

        for (const command of node.keys) {
          if(!controlPointTypes.includes(command.key)){
            console.error(`Command key ${command.key} is not of type authorized... Skipping it`);
            continue;
          }
          const controlPoints = await _node.getChildren('hasControlPoints');
          for (const controlPoint of controlPoints) {
            if (controlPoint.getName().get() === "Command") { // Name of cp profile 
              const bmsEndpointsChildControlPoint = await controlPoint.getChildren('hasBmsEndpoint')
              for (const bmsEndPoint of bmsEndpointsChildControlPoint) {
                if (bmsEndPoint.getName().get() === command.key) {
                  SpinalGraphService._addNode(bmsEndPoint);
                  await updateControlEndpointWithAnalytic(SpinalGraphService.getInfo(bmsEndPoint.getId().get()), command.value, InputDataEndpointDataType.Real, InputDataEndpointType.Other)
                  bmsEndPoint.info.directModificationDate.set(Date.now());
                }
              }
            }
          }

        }


      }
      res.status(200).send("Command updates executed successfully");

    } catch (error) {
      console.error(error);
      res.status(400).send("One of the nodes is not loaded");
    }
  });
};


async function loadContextByStaticId (contextStaticId : string) {
  if (SpinalGraphService.getRealNode(contextStaticId)) {
    return SpinalGraphService.getRealNode(contextStaticId);
  } else if (SpinalGraphService.getContext(contextStaticId)) {
    return SpinalGraphService.getContext(contextStaticId);
  }
  return undefined;
}

async function loadNodeByStaticId (nodeStaticId : string , context: SpinalContext<any>) {
  let resultNode = SpinalGraphService.getRealNode(
    nodeStaticId
  );
  console.log("context", context.getName().get());

  if (typeof resultNode === 'undefined') {
    resultNode = await findOneInContext(
      context,
      context,
      (n) => n.getId().get() === nodeStaticId
    );
  }
 return resultNode;
}

function isNumeric(str) {
  return /^[0-9]+$/.test(str);
}
