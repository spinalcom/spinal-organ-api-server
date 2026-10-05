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
   *         - write
   *     summary: Set command values on several nodes
   *     description: >-
   *       Writes command control points on a batch of nodes. For each entry the route walks the node's
   *       `hasControlPoints` children, looks inside the profile named `Command`, and writes each
   *       requested `key` with its `value`.
   *
   *
   *       Nodes are addressed by `dynamicId` when it is numeric, and by `staticId` otherwise - a
   *       `staticId` requires `context` to be given at the top level, since the node is then searched
   *       inside that context.
   *
   *
   *       Only `geographicRoom`, `geographicFloor`, `geographicRoomGroup`, `BIMObject` and
   *       `BIMObjectGroup` nodes are acted on; a node of any other type is **skipped silently**, and a
   *       key the node does not carry is skipped too. The answer is a plain success message, so it does
   *       not say which writes actually landed - read the control points back to confirm.
   *     tags:
   *      - Command
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - propertyReference
   *             properties:
   *               context:
   *                 type: string
   *                 description: >-
   *                   Context to search in, as a name, a dynamic ID or a static ID. Required as soon as
   *                   one entry is addressed by `staticId`.
   *               propertyReference:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     dynamicId:
   *                       type: string
   *                       description: Dynamic ID of the node. Used when it is numeric.
   *                     staticId:
   *                       type: string
   *                       description: Static ID of the node. Used when `dynamicId` is not numeric; needs `context`.
   *                     keys:
   *                       type: array
   *                       description: The command control points to write on that node.
   *                       items:
   *                         type: object
   *                         properties:
   *                           key:
   *                             type: string
   *                             description: Name of the command endpoint, for instance `COMMAND_LIGHT`.
   *                           value:
   *                             type: string
   *                             description: The value to write.
   *     responses:
   *       200:
   *         description: The batch ran ("Command updates executed successfully").
   *         content:
   *           text/plain:
   *             schema:
   *               type: string
   *       400:
   *         description: >-
   *           A `staticId` was given without a `context` ("Trying to load a node with staticId but no
   *           context provided"), the context was not found ("Context not found"), a node could not be
   *           found ("Node could not be found"), or one of the nodes could not be loaded.
   *       401:
   *         description: The profile is not allowed to write on one of the nodes.
   */

  app.post('/api/v1/node/command', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const nodetypes = ["geographicRoom", "BIMObject", "BIMObjectGroup", "geographicRoomGroup", "geographicFloor"];
      // const controlPointTypes = ["COMMAND_BLIND", "COMMAND_BLIND_ROTATION", "COMMAND_LIGHT", "COMMAND_TEMPERATURE", "COMMAND_VENTILATION"];
      const paramContext = req.body.context;
      const nodes = req.body.propertyReference;
      let context: SpinalContext<any>;
      let _node: SpinalNode<any>;


      for (const node of nodes) {
        if (isNumeric(node.dynamicId)) { // If dynamicId is not empty and looks like a number, load the node by dynamicId
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



        if (!nodetypes.includes(_node.getType().get())) {
          console.error(`Node with dynamicId ${node.dynamicId} is not of type authorized... Skipping it`);
          continue;
        }

        for (const command of node.keys) {
          // if (!controlPointTypes.includes(command.key)) {
          //   console.error(`Command key ${command.key} is not of type authorized... Skipping it`);
          //   continue;
          // }
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


async function loadContextByStaticId(contextStaticId: string) {
  if (SpinalGraphService.getRealNode(contextStaticId)) {
    return SpinalGraphService.getRealNode(contextStaticId);
  } else if (SpinalGraphService.getContext(contextStaticId)) {
    return SpinalGraphService.getContext(contextStaticId);
  }
  return undefined;
}

async function loadNodeByStaticId(nodeStaticId: string, context: SpinalContext<any>) {
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
